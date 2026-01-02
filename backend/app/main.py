from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .config import get_settings
from .database import init_db, close_db, async_session_maker
from .routers import (
    workspaces_router,
    pages_router,
    spark_router,
    execute_router,
    health_router,
    schemas_router,
    airflow_router,
    dags_router,
    auth_router,
    members_router,
)

settings = get_settings()
logger = logging.getLogger(__name__)


async def ensure_default_spark_connection():
    """Create a default Local Spark connection if none exists."""
    from sqlalchemy import select
    from .models import SparkConnection
    from datetime import datetime, timezone
    import uuid

    async with async_session_maker() as session:
        # Check if any connection exists
        result = await session.execute(select(SparkConnection))
        connections = result.scalars().all()

        if not connections:
            # Create default local connection
            now = datetime.now(timezone.utc)
            default_connection = SparkConnection(
                id=str(uuid.uuid4()),
                name="Local Spark",
                connection_type="local",
                master_url="local[*]",
                config={
                    "spark.driver.memory": "2g",
                    "spark.executor.memory": "2g"
                },
                is_default=True,
                created_at=now,
                updated_at=now,
            )
            session.add(default_connection)
            await session.commit()
            logger.info("Created default Local Spark connection")
        else:
            # Ensure at least one is default
            has_default = any(c.is_default for c in connections)
            if not has_default:
                connections[0].is_default = True
                await session.commit()
                logger.info(f"Set '{connections[0].name}' as default connection")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    await init_db()
    await ensure_default_spark_connection()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title=settings.app_name,
    description="Visual ETL tool for PySpark code generation",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(auth_router, prefix="/api")
app.include_router(members_router)
app.include_router(workspaces_router)
app.include_router(pages_router)
app.include_router(spark_router)
app.include_router(execute_router)
app.include_router(schemas_router)
app.include_router(airflow_router)
app.include_router(dags_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "app": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
    }
