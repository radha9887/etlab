"""
API tests for app/routers/health.py
"""
import pytest


@pytest.mark.asyncio
class TestHealthCheck:
    """Tests for GET /api/health."""

    async def test_health_check(self, client):
        """Test basic health check."""
        response = await client.get("/api/health")

        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "healthy"
        assert "app" in data
        assert "env" in data
        assert "database_type" in data

    async def test_health_check_returns_app_name(self, client):
        """Test health check returns app name."""
        response = await client.get("/api/health")
        data = response.json()

        assert data["app"] == "ETLab"


@pytest.mark.asyncio
class TestDatabaseHealth:
    """Tests for GET /api/health/db."""

    async def test_database_health(self, client):
        """Test database health check."""
        response = await client.get("/api/health/db")

        # Should be either 200 (healthy) or 503 (unhealthy)
        assert response.status_code in [200, 503]

        data = response.json()
        assert "status" in data

    async def test_database_health_includes_details(self, client):
        """Test database health includes details when healthy."""
        response = await client.get("/api/health/db")

        if response.status_code == 200:
            data = response.json()
            assert data["status"] == "healthy"


@pytest.mark.asyncio
class TestDatabaseInfo:
    """Tests for GET /api/health/db/info."""

    async def test_database_info(self, client):
        """Test database info endpoint."""
        response = await client.get("/api/health/db/info")

        assert response.status_code == 200
        data = response.json()

        assert "type" in data

    async def test_database_info_masks_password(self, client):
        """Test that database info masks sensitive data."""
        response = await client.get("/api/health/db/info")
        data = response.json()

        # Should not contain actual passwords
        data_str = str(data)
        assert "password123" not in data_str.lower()


@pytest.mark.asyncio
class TestSparkHealth:
    """Tests for GET /api/health/spark."""

    async def test_spark_health(self, client):
        """Test Spark health check."""
        response = await client.get("/api/health/spark")

        assert response.status_code == 200
        data = response.json()

        assert "status" in data
        assert "message" in data

    async def test_spark_health_with_connection(self, client, test_spark_connection):
        """Test Spark health with a configured connection."""
        response = await client.get("/api/health/spark")

        assert response.status_code == 200
        data = response.json()

        # Should show the connection info
        assert "status" in data
        if data["status"] == "healthy":
            assert "connection_name" in data
            assert "connection_type" in data
