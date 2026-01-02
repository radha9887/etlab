"""
API tests for app/routers/schemas.py
"""
import pytest


@pytest.mark.asyncio
class TestListSchemas:
    """Tests for GET /api/workspaces/{workspace_id}/schemas."""

    async def test_list_schemas_empty(self, client, test_workspace):
        """Test listing schemas when none exist."""
        workspace_id = test_workspace["id"]

        response = await client.get(f"/api/workspaces/{workspace_id}/schemas")

        assert response.status_code == 200
        data = response.json()
        assert "schemas" in data
        assert "total" in data
        assert data["total"] == 0

    async def test_list_schemas_workspace_not_found(self, client):
        """Test listing schemas for non-existent workspace."""
        response = await client.get("/api/workspaces/nonexistent/schemas")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestCreateSchema:
    """Tests for POST /api/workspaces/{workspace_id}/schemas."""

    async def test_create_schema(self, client, test_workspace):
        """Test creating a schema definition."""
        workspace_id = test_workspace["id"]

        response = await client.post(
            f"/api/workspaces/{workspace_id}/schemas",
            json={
                "workspace_id": workspace_id,
                "name": "test_table",
                "description": "A test table",
                "source_type": "parquet",
                "columns": [
                    {"name": "id", "dataType": "long", "nullable": False},
                    {"name": "name", "dataType": "string", "nullable": True}
                ]
            }
        )

        assert response.status_code == 201
        data = response.json()

        assert data["name"] == "test_table"
        assert data["source_type"] == "parquet"
        assert len(data["columns"]) == 2

    async def test_create_schema_with_config(self, client, test_workspace):
        """Test creating schema with source config."""
        workspace_id = test_workspace["id"]

        response = await client.post(
            f"/api/workspaces/{workspace_id}/schemas",
            json={
                "workspace_id": workspace_id,
                "name": "csv_table",
                "source_type": "csv",
                "columns": [{"name": "col1", "dataType": "string"}],
                "config": {"path": "/data/file.csv", "header": True}
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert data["config"]["path"] == "/data/file.csv"

    async def test_create_schema_with_tags(self, client, test_workspace):
        """Test creating schema with tags."""
        workspace_id = test_workspace["id"]

        response = await client.post(
            f"/api/workspaces/{workspace_id}/schemas",
            json={
                "workspace_id": workspace_id,
                "name": "tagged_table",
                "source_type": "parquet",
                "columns": [],
                "tags": ["production", "customer"]
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert "production" in data["tags"]
        assert "customer" in data["tags"]

    async def test_create_schema_workspace_not_found(self, client):
        """Test creating schema in non-existent workspace."""
        response = await client.post(
            "/api/workspaces/nonexistent/schemas",
            json={
                "workspace_id": "nonexistent",
                "name": "test",
                "source_type": "csv",
                "columns": []
            }
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestGetSchema:
    """Tests for GET /api/schemas/{schema_id}."""

    async def test_get_schema(self, client, test_workspace):
        """Test getting a schema by ID."""
        workspace_id = test_workspace["id"]

        # Create a schema first
        create_response = await client.post(
            f"/api/workspaces/{workspace_id}/schemas",
            json={
                "workspace_id": workspace_id,
                "name": "get_test",
                "source_type": "parquet",
                "columns": [{"name": "id", "dataType": "long"}]
            }
        )
        schema_id = create_response.json()["id"]

        # Get it
        response = await client.get(f"/api/schemas/{schema_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == schema_id
        assert data["name"] == "get_test"

    async def test_get_schema_not_found(self, client):
        """Test getting non-existent schema."""
        response = await client.get("/api/schemas/nonexistent")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestUpdateSchema:
    """Tests for PUT /api/schemas/{schema_id}."""

    async def test_update_schema_name(self, client, test_workspace):
        """Test updating schema name."""
        workspace_id = test_workspace["id"]

        # Create schema
        create_response = await client.post(
            f"/api/workspaces/{workspace_id}/schemas",
            json={"workspace_id": workspace_id, "name": "original", "source_type": "csv", "columns": []}
        )
        schema_id = create_response.json()["id"]

        # Update
        response = await client.put(
            f"/api/schemas/{schema_id}",
            json={"name": "updated"}
        )

        assert response.status_code == 200
        assert response.json()["name"] == "updated"

    async def test_update_schema_columns(self, client, test_workspace):
        """Test updating schema columns."""
        workspace_id = test_workspace["id"]

        # Create schema
        create_response = await client.post(
            f"/api/workspaces/{workspace_id}/schemas",
            json={
                "workspace_id": workspace_id,
                "name": "cols_test",
                "source_type": "csv",
                "columns": [{"name": "old_col", "dataType": "string"}]
            }
        )
        schema_id = create_response.json()["id"]

        # Update columns
        new_columns = [
            {"name": "new_col1", "dataType": "long"},
            {"name": "new_col2", "dataType": "string"}
        ]
        response = await client.put(
            f"/api/schemas/{schema_id}",
            json={"columns": new_columns}
        )

        assert response.status_code == 200
        assert len(response.json()["columns"]) == 2

    async def test_update_schema_not_found(self, client):
        """Test updating non-existent schema."""
        response = await client.put(
            "/api/schemas/nonexistent",
            json={"name": "new_name"}
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestDeleteSchema:
    """Tests for DELETE /api/schemas/{schema_id}."""

    async def test_delete_schema(self, client, test_workspace):
        """Test deleting a schema."""
        workspace_id = test_workspace["id"]

        # Create schema
        create_response = await client.post(
            f"/api/workspaces/{workspace_id}/schemas",
            json={"workspace_id": workspace_id, "name": "to_delete", "source_type": "csv", "columns": []}
        )
        schema_id = create_response.json()["id"]

        # Delete
        response = await client.delete(f"/api/schemas/{schema_id}")

        assert response.status_code == 204

        # Verify deleted
        get_response = await client.get(f"/api/schemas/{schema_id}")
        assert get_response.status_code == 404

    async def test_delete_schema_not_found(self, client):
        """Test deleting non-existent schema."""
        response = await client.delete("/api/schemas/nonexistent")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestDuplicateSchema:
    """Tests for POST /api/schemas/{schema_id}/duplicate."""

    async def test_duplicate_schema(self, client, test_workspace):
        """Test duplicating a schema."""
        workspace_id = test_workspace["id"]

        # Create schema
        create_response = await client.post(
            f"/api/workspaces/{workspace_id}/schemas",
            json={
                "workspace_id": workspace_id,
                "name": "original",
                "source_type": "parquet",
                "columns": [{"name": "col1", "dataType": "string"}],
                "is_favorite": True
            }
        )
        schema_id = create_response.json()["id"]

        # Duplicate
        response = await client.post(f"/api/schemas/{schema_id}/duplicate")

        assert response.status_code == 201
        data = response.json()
        assert "(Copy)" in data["name"]
        assert data["id"] != schema_id
        assert data["is_favorite"] is False  # Reset on duplicate
        assert len(data["columns"]) == 1


@pytest.mark.asyncio
class TestToggleFavorite:
    """Tests for PATCH /api/schemas/{schema_id}/favorite."""

    async def test_toggle_favorite(self, client, test_workspace):
        """Test toggling favorite status."""
        workspace_id = test_workspace["id"]

        # Create non-favorite schema
        create_response = await client.post(
            f"/api/workspaces/{workspace_id}/schemas",
            json={
                "workspace_id": workspace_id,
                "name": "fav_test",
                "source_type": "csv",
                "columns": [],
                "is_favorite": False
            }
        )
        schema_id = create_response.json()["id"]

        # Toggle to favorite
        response = await client.patch(f"/api/schemas/{schema_id}/favorite")

        assert response.status_code == 200
        assert response.json()["is_favorite"] is True

        # Toggle back
        response = await client.patch(f"/api/schemas/{schema_id}/favorite")
        assert response.json()["is_favorite"] is False


@pytest.mark.asyncio
class TestLoadDefaultSchemas:
    """Tests for POST /api/workspaces/{workspace_id}/schemas/defaults."""

    async def test_load_default_schemas(self, client, test_workspace):
        """Test loading default schemas."""
        workspace_id = test_workspace["id"]

        response = await client.post(
            f"/api/workspaces/{workspace_id}/schemas/defaults"
        )

        assert response.status_code == 201
        data = response.json()

        assert "loaded" in data
        assert data["loaded"] > 0
        assert "schemas" in data

    async def test_load_default_schemas_idempotent(self, client, test_workspace):
        """Test that loading defaults twice doesn't duplicate."""
        workspace_id = test_workspace["id"]

        # Load once
        response1 = await client.post(
            f"/api/workspaces/{workspace_id}/schemas/defaults"
        )
        first_count = response1.json()["loaded"]

        # Load again
        response2 = await client.post(
            f"/api/workspaces/{workspace_id}/schemas/defaults"
        )
        second_count = response2.json()["loaded"]

        # Second load should add nothing (all exist)
        assert second_count == 0
