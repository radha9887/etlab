"""
Pytest configuration and fixtures for ETLab tests.
"""
import pytest
import pytest_asyncio
import os
import sys
from pathlib import Path
from typing import AsyncGenerator, Generator
from unittest.mock import patch, MagicMock

# Add app to path
sys.path.insert(0, str(Path(__file__).parent.parent))


# ============================================================================
# Environment Setup
# ============================================================================

# Set test environment variables before importing app
os.environ["APP_ENV"] = "testing"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-unit-tests-only"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"
os.environ["REFRESH_TOKEN_EXPIRE_DAYS"] = "7"


# ============================================================================
# Database Fixtures
# ============================================================================

@pytest_asyncio.fixture
async def test_db():
    """Create a test database with tables."""
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
    from app.database import Base

    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_db) -> AsyncGenerator:
    """Alias for test_db for compatibility."""
    yield test_db


# ============================================================================
# FastAPI Test Client Fixtures
# ============================================================================

@pytest_asyncio.fixture
async def app():
    """Create test FastAPI application."""
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
    from app.database import Base, get_db
    from app.main import app as fastapi_app

    # Create test engine
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def override_get_db():
        async with async_session() as session:
            yield session
            await session.commit()

    fastapi_app.dependency_overrides[get_db] = override_get_db

    yield fastapi_app

    fastapi_app.dependency_overrides.clear()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture
async def client(app):
    """Create async test client."""
    from httpx import AsyncClient, ASGITransport

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac


# ============================================================================
# User and Auth Fixtures
# ============================================================================

@pytest_asyncio.fixture
async def test_user(app, client):
    """Create a test user and return user data."""
    user_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "name": "Test User"
    }

    response = await client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201

    data = response.json()
    return {
        "user": data["user"],
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
        "password": user_data["password"],
    }


@pytest_asyncio.fixture
async def auth_headers(test_user):
    """Get authorization headers for authenticated requests."""
    return {"Authorization": f"Bearer {test_user['access_token']}"}


@pytest_asyncio.fixture
async def second_user(app, client):
    """Create a second test user."""
    user_data = {
        "email": "second@example.com",
        "password": "secondpassword123",
        "name": "Second User"
    }

    response = await client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201

    data = response.json()
    return {
        "user": data["user"],
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
    }


# ============================================================================
# Workspace and Page Fixtures
# ============================================================================

@pytest_asyncio.fixture
async def test_workspace(client):
    """Create a test workspace."""
    response = await client.post(
        "/api/workspaces",
        json={"name": "Test Workspace", "description": "Test description"}
    )
    assert response.status_code == 201
    return response.json()


@pytest_asyncio.fixture
async def test_page(client, test_workspace):
    """Create a test page in the workspace."""
    response = await client.post(
        f"/api/workspaces/{test_workspace['id']}/pages",
        json={"name": "Test Page"}
    )
    assert response.status_code == 201
    return response.json()


# ============================================================================
# Spark Connection Fixtures
# ============================================================================

@pytest_asyncio.fixture
async def test_spark_connection(client):
    """Create a test Spark connection."""
    response = await client.post(
        "/api/spark-connections",
        json={
            "name": "Test Local Spark",
            "connection_type": "local",
            "master_url": "local[*]",
            "config": {"spark.driver.memory": "1g"},
            "is_default": True
        }
    )
    assert response.status_code == 201
    return response.json()


# ============================================================================
# Mock Fixtures
# ============================================================================

@pytest.fixture
def mock_spark_session():
    """Mock SparkSession for tests that don't need real Spark."""
    mock = MagicMock()
    mock.version = "3.5.0"
    mock.sparkContext.version = "3.5.0"
    return mock


@pytest.fixture
def mock_pyspark():
    """Mock pyspark module."""
    mock = MagicMock()
    mock.__version__ = "3.5.0"
    return mock


# ============================================================================
# Integration Test Fixtures (from original conftest)
# ============================================================================

# Get the test data directory
TEST_DIR = Path(__file__).parent
TEST_DATA_DIR = TEST_DIR / "test_data"
INPUT_DIR = TEST_DATA_DIR / "input"


@pytest.fixture(scope="session")
def spark():
    """
    Create a SparkSession for integration testing.
    Scope is session to reuse across all tests (faster).
    """
    # Skip if pyspark not available
    pytest.importorskip("pyspark")

    from pyspark.sql import SparkSession

    builder = SparkSession.builder \
        .master(os.environ.get("SPARK_MASTER", "local[*]")) \
        .appName("ETLab-Tests") \
        .config("spark.sql.shuffle.partitions", "2") \
        .config("spark.default.parallelism", "2") \
        .config("spark.ui.enabled", "false") \
        .config("spark.sql.warehouse.dir", str(TEST_DIR / "spark-warehouse"))

    spark = builder.getOrCreate()
    spark.sparkContext.setLogLevel("WARN")

    yield spark

    spark.stop()


@pytest.fixture
def input_dir():
    """Return the path to test input data directory."""
    return INPUT_DIR


@pytest.fixture
def output_dir(tmp_path):
    """Create a temporary output directory for each test."""
    output = tmp_path / "output"
    output.mkdir(parents=True, exist_ok=True)
    return output


# ============================================================================
# Pytest Configuration
# ============================================================================

def pytest_configure(config):
    """Add custom markers."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )


def pytest_collection_modifyitems(config, items):
    """Auto-mark tests based on their location."""
    for item in items:
        if "/unit/" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        elif "/api/" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        elif "/integration/" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
