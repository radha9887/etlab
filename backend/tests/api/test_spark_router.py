"""
API tests for app/routers/spark.py
"""
import pytest


@pytest.mark.asyncio
class TestListSparkConnections:
    """Tests for GET /api/spark-connections."""

    async def test_list_connections_empty(self, client):
        """Test listing connections when none exist."""
        response = await client.get("/api/spark-connections")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_list_connections_with_data(self, client, test_spark_connection):
        """Test listing connections with data."""
        response = await client.get("/api/spark-connections")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

        conn = data[0]
        assert "id" in conn
        assert "name" in conn
        assert "connection_type" in conn
        assert "is_default" in conn

    async def test_list_connections_order(self, client):
        """Test connections are ordered by default first, then name."""
        # Create non-default connection
        await client.post(
            "/api/spark-connections",
            json={
                "name": "B Connection",
                "connection_type": "local",
                "is_default": False
            }
        )

        # Create default connection
        await client.post(
            "/api/spark-connections",
            json={
                "name": "A Connection",
                "connection_type": "local",
                "is_default": True
            }
        )

        response = await client.get("/api/spark-connections")
        data = response.json()

        # Default should be first
        assert data[0]["is_default"] is True


@pytest.mark.asyncio
class TestCreateSparkConnection:
    """Tests for POST /api/spark-connections."""

    async def test_create_connection(self, client):
        """Test creating a Spark connection."""
        response = await client.post(
            "/api/spark-connections",
            json={
                "name": "My Spark",
                "connection_type": "local",
                "master_url": "local[*]",
                "is_default": True
            }
        )

        assert response.status_code == 201
        data = response.json()

        assert data["name"] == "My Spark"
        assert data["connection_type"] == "local"
        assert data["master_url"] == "local[*]"
        assert data["is_default"] is True

    async def test_create_connection_with_config(self, client):
        """Test creating connection with Spark config."""
        config = {
            "spark.driver.memory": "4g",
            "spark.executor.memory": "4g"
        }

        response = await client.post(
            "/api/spark-connections",
            json={
                "name": "Configured Spark",
                "connection_type": "local",
                "config": config,
                "is_default": False
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert data["config"] == config

    async def test_create_default_unsets_others(self, client):
        """Test that creating default connection unsets other defaults."""
        # Create first default
        response1 = await client.post(
            "/api/spark-connections",
            json={
                "name": "First Default",
                "connection_type": "local",
                "is_default": True
            }
        )
        first_id = response1.json()["id"]

        # Create second default
        response2 = await client.post(
            "/api/spark-connections",
            json={
                "name": "Second Default",
                "connection_type": "local",
                "is_default": True
            }
        )

        # Check first is no longer default
        get_response = await client.get(f"/api/spark-connections/{first_id}")
        assert get_response.json()["is_default"] is False


@pytest.mark.asyncio
class TestGetSparkConnection:
    """Tests for GET /api/spark-connections/{connection_id}."""

    async def test_get_connection(self, client, test_spark_connection):
        """Test getting a connection by ID."""
        conn_id = test_spark_connection["id"]

        response = await client.get(f"/api/spark-connections/{conn_id}")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == conn_id
        assert "name" in data
        assert "connection_type" in data
        assert "config" in data

    async def test_get_connection_not_found(self, client):
        """Test getting non-existent connection."""
        response = await client.get("/api/spark-connections/nonexistent")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestUpdateSparkConnection:
    """Tests for PUT /api/spark-connections/{connection_id}."""

    async def test_update_connection_name(self, client, test_spark_connection):
        """Test updating connection name."""
        conn_id = test_spark_connection["id"]

        response = await client.put(
            f"/api/spark-connections/{conn_id}",
            json={"name": "Updated Name"}
        )

        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"

    async def test_update_connection_config(self, client, test_spark_connection):
        """Test updating connection config."""
        conn_id = test_spark_connection["id"]

        new_config = {"spark.driver.memory": "8g"}
        response = await client.put(
            f"/api/spark-connections/{conn_id}",
            json={"config": new_config}
        )

        assert response.status_code == 200
        assert response.json()["config"] == new_config

    async def test_update_connection_not_found(self, client):
        """Test updating non-existent connection."""
        response = await client.put(
            "/api/spark-connections/nonexistent",
            json={"name": "New Name"}
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestDeleteSparkConnection:
    """Tests for DELETE /api/spark-connections/{connection_id}."""

    async def test_delete_connection(self, client):
        """Test deleting a connection."""
        # Create a connection to delete
        create_response = await client.post(
            "/api/spark-connections",
            json={
                "name": "To Delete",
                "connection_type": "local",
                "is_default": False
            }
        )
        conn_id = create_response.json()["id"]

        # Delete it
        response = await client.delete(f"/api/spark-connections/{conn_id}")

        assert response.status_code == 204

        # Verify deleted
        get_response = await client.get(f"/api/spark-connections/{conn_id}")
        assert get_response.status_code == 404

    async def test_delete_connection_not_found(self, client):
        """Test deleting non-existent connection."""
        response = await client.delete("/api/spark-connections/nonexistent")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestTestSparkConnection:
    """Tests for POST /api/spark-connections/{connection_id}/test."""

    async def test_test_connection(self, client, test_spark_connection):
        """Test testing a Spark connection."""
        conn_id = test_spark_connection["id"]

        response = await client.post(f"/api/spark-connections/{conn_id}/test")

        assert response.status_code == 200
        data = response.json()

        assert "success" in data
        assert "message" in data

    async def test_test_connection_not_found(self, client):
        """Test testing non-existent connection."""
        response = await client.post("/api/spark-connections/nonexistent/test")

        assert response.status_code == 404

    async def test_test_unsupported_connection_type(self, client):
        """Test testing connection with unsupported type."""
        # Create connection with unsupported type
        # Note: This requires modifying the connection after creation
        # since create validates the type
        create_response = await client.post(
            "/api/spark-connections",
            json={
                "name": "Unsupported",
                "connection_type": "local",  # Create as local first
                "is_default": False
            }
        )
        conn_id = create_response.json()["id"]

        # Update to unsupported type (this tests the update path)
        await client.put(
            f"/api/spark-connections/{conn_id}",
            json={"connection_type": "unsupported_type"}
        )

        # Test it
        response = await client.post(f"/api/spark-connections/{conn_id}/test")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False


@pytest.mark.asyncio
class TestSetDefaultConnection:
    """Tests for PUT /api/spark-connections/{connection_id}/default."""

    async def test_set_default_connection(self, client):
        """Test setting a connection as default."""
        # Create non-default connection
        create_response = await client.post(
            "/api/spark-connections",
            json={
                "name": "To Be Default",
                "connection_type": "local",
                "is_default": False
            }
        )
        conn_id = create_response.json()["id"]

        # Set as default
        response = await client.put(f"/api/spark-connections/{conn_id}/default")

        assert response.status_code == 200
        assert response.json()["is_default"] is True

    async def test_set_default_unsets_others(self, client):
        """Test that setting default unsets other defaults."""
        # Create first default
        response1 = await client.post(
            "/api/spark-connections",
            json={
                "name": "First",
                "connection_type": "local",
                "is_default": True
            }
        )
        first_id = response1.json()["id"]

        # Create second connection
        response2 = await client.post(
            "/api/spark-connections",
            json={
                "name": "Second",
                "connection_type": "local",
                "is_default": False
            }
        )
        second_id = response2.json()["id"]

        # Set second as default
        await client.put(f"/api/spark-connections/{second_id}/default")

        # Check first is no longer default
        get_response = await client.get(f"/api/spark-connections/{first_id}")
        assert get_response.json()["is_default"] is False

    async def test_set_default_not_found(self, client):
        """Test setting default on non-existent connection."""
        response = await client.put("/api/spark-connections/nonexistent/default")

        assert response.status_code == 404
