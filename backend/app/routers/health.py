from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ..database import check_db_connection, get_db_info
from ..config import get_settings

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("")
async def health_check():
    """Overall health check."""
    settings = get_settings()
    db_info = get_db_info()
    return {
        "status": "healthy",
        "app": settings.app_name,
        "env": settings.app_env,
        "database_type": db_info["type"],
    }


@router.get("/db")
async def database_health():
    """Database health check with detailed info."""
    result = await check_db_connection()

    # Return 503 if unhealthy
    if result["status"] == "unhealthy":
        return JSONResponse(status_code=503, content=result)

    return result


@router.get("/db/info")
async def database_info():
    """Get database configuration info (passwords masked)."""
    return get_db_info()


@router.get("/spark")
async def spark_health():
    """Spark health check - tests the default connection."""
    from sqlalchemy import select
    from ..database import async_session_maker
    from ..models import SparkConnection
    from ..services import ExecutorFactory

    settings = get_settings()

    try:
        # Get default connection
        async with async_session_maker() as session:
            result = await session.execute(
                select(SparkConnection).where(SparkConnection.is_default == True)
            )
            connection = result.scalar_one_or_none()

        if not connection:
            return {
                "status": "warning",
                "message": "No default Spark connection configured",
                "default_master": settings.spark_master,
            }

        # Test the connection
        if ExecutorFactory.is_supported(connection.connection_type):
            executor = ExecutorFactory.create(
                connection_type=connection.connection_type,
                master_url=connection.master_url,
                config=connection.config
            )
            test_result = await executor.test_connection()

            return {
                "status": "healthy" if test_result.get("success") else "unhealthy",
                "message": test_result.get("message", "Unknown"),
                "connection_name": connection.name,
                "connection_type": connection.connection_type,
                "master_url": connection.master_url,
                "details": test_result.get("details"),
            }
        else:
            return {
                "status": "warning",
                "message": f"Connection type '{connection.connection_type}' not supported",
                "connection_name": connection.name,
            }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Error checking Spark health: {str(e)}",
        }
