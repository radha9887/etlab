from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import event, text
from typing import AsyncGenerator, Dict, Any
import os
import logging

from .config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


def get_database_type(url: str) -> str:
    """Extract database type from URL."""
    if "sqlite" in url:
        return "sqlite"
    elif "postgresql" in url or "postgres" in url:
        return "postgresql"
    elif "mysql" in url:
        return "mysql"
    else:
        return "unknown"


# Database type
DB_TYPE = get_database_type(settings.database_url)

# Create data directory if using SQLite
if DB_TYPE == "sqlite":
    os.makedirs("data", exist_ok=True)

# Engine configuration based on database type
engine_kwargs: Dict[str, Any] = {
    "echo": settings.debug,
    "future": True,
}

# Add pool settings for connection-based databases
if DB_TYPE in ("postgresql", "mysql"):
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 1800,  # Recycle connections after 30 minutes
        "pool_pre_ping": True,  # Verify connections before use
    })

# Create async engine
engine = create_async_engine(
    settings.database_url,
    **engine_kwargs
)

# For SQLite, enable foreign keys
if DB_TYPE == "sqlite":
    @event.listens_for(engine.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Create async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info(f"Database initialized ({DB_TYPE})")


async def close_db():
    """Close database connections."""
    await engine.dispose()
    logger.info("Database connections closed")


async def check_db_connection() -> Dict[str, Any]:
    """
    Check database connection and return status info.
    Returns dict with status, database type, and any error.
    """
    try:
        async with async_session_maker() as session:
            # Execute a simple query to verify connection
            if DB_TYPE == "sqlite":
                result = await session.execute(text("SELECT sqlite_version()"))
                version = result.scalar()
                db_info = f"SQLite {version}"
            elif DB_TYPE == "postgresql":
                result = await session.execute(text("SELECT version()"))
                version = result.scalar()
                db_info = version.split(",")[0] if version else "PostgreSQL"
            elif DB_TYPE == "mysql":
                result = await session.execute(text("SELECT version()"))
                version = result.scalar()
                db_info = f"MySQL {version}"
            else:
                await session.execute(text("SELECT 1"))
                db_info = DB_TYPE

            return {
                "status": "healthy",
                "database": "connected",
                "type": DB_TYPE,
                "info": db_info,
            }
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "type": DB_TYPE,
            "error": str(e),
        }


def get_db_info() -> Dict[str, str]:
    """Get database configuration info (without sensitive data)."""
    url = settings.database_url
    # Mask password in URL for display
    if "@" in url:
        # Format: driver://user:pass@host/db
        prefix, rest = url.split("://", 1)
        if "@" in rest:
            creds, host_db = rest.rsplit("@", 1)
            if ":" in creds:
                user, _ = creds.split(":", 1)
                masked_url = f"{prefix}://{user}:****@{host_db}"
            else:
                masked_url = f"{prefix}://{creds}@{host_db}"
        else:
            masked_url = url
    else:
        masked_url = url

    return {
        "type": DB_TYPE,
        "url": masked_url,
    }
