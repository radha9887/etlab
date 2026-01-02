"""
API tests for app/routers/workspaces.py
"""
import pytest
from datetime import datetime, timezone


@pytest.mark.asyncio
class TestListWorkspaces:
    """Tests for GET /api/workspaces."""

    async def test_list_workspaces_empty(self, client):
        """Test listing workspaces when none exist."""
        response = await client.get("/api/workspaces")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    async def test_list_workspaces_with_data(self, client, test_workspace):
        """Test listing workspaces with data."""
        response = await client.get("/api/workspaces")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check workspace structure
        workspace = data[0]
        assert "id" in workspace
        assert "name" in workspace
        assert "page_count" in workspace
        assert "created_at" in workspace
        assert "updated_at" in workspace

    async def test_list_workspaces_order(self, client):
        """Test that workspaces are ordered by updated_at desc."""
        # Create multiple workspaces
        await client.post("/api/workspaces", json={"name": "First"})
        await client.post("/api/workspaces", json={"name": "Second"})
        await client.post("/api/workspaces", json={"name": "Third"})

        response = await client.get("/api/workspaces")
        data = response.json()

        # Most recently created should be first
        assert data[0]["name"] == "Third"


@pytest.mark.asyncio
class TestCreateWorkspace:
    """Tests for POST /api/workspaces."""

    async def test_create_workspace(self, client):
        """Test creating a workspace."""
        response = await client.post(
            "/api/workspaces",
            json={"name": "My Workspace"}
        )

        assert response.status_code == 201
        data = response.json()

        assert "id" in data
        assert data["name"] == "My Workspace"
        assert "pages" in data
        assert len(data["pages"]) == 1  # Default page created
        assert data["pages"][0]["name"] == "Page 1"

    async def test_create_workspace_with_description(self, client):
        """Test creating a workspace with description."""
        response = await client.post(
            "/api/workspaces",
            json={
                "name": "My Workspace",
                "description": "A test workspace"
            }
        )

        assert response.status_code == 201
        data = response.json()

        assert data["description"] == "A test workspace"

    async def test_create_workspace_missing_name(self, client):
        """Test creating workspace without name fails."""
        response = await client.post(
            "/api/workspaces",
            json={}
        )

        assert response.status_code == 422


@pytest.mark.asyncio
class TestGetWorkspace:
    """Tests for GET /api/workspaces/{workspace_id}."""

    async def test_get_workspace_success(self, client, test_workspace):
        """Test getting a workspace by ID."""
        workspace_id = test_workspace["id"]

        response = await client.get(f"/api/workspaces/{workspace_id}")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == workspace_id
        assert data["name"] == "Test Workspace"
        assert "pages" in data
        assert "active_page_id" in data

    async def test_get_workspace_not_found(self, client):
        """Test getting non-existent workspace returns 404."""
        response = await client.get("/api/workspaces/nonexistent-id")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    async def test_get_workspace_includes_pages(self, client, test_workspace):
        """Test that workspace includes its pages."""
        workspace_id = test_workspace["id"]

        response = await client.get(f"/api/workspaces/{workspace_id}")
        data = response.json()

        assert len(data["pages"]) >= 1
        page = data["pages"][0]
        assert "id" in page
        assert "name" in page
        assert "nodes" in page
        assert "edges" in page


@pytest.mark.asyncio
class TestUpdateWorkspace:
    """Tests for PUT /api/workspaces/{workspace_id}."""

    async def test_update_workspace_name(self, client, test_workspace):
        """Test updating workspace name."""
        workspace_id = test_workspace["id"]

        response = await client.put(
            f"/api/workspaces/{workspace_id}",
            json={"name": "Updated Name"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"

    async def test_update_workspace_description(self, client, test_workspace):
        """Test updating workspace description."""
        workspace_id = test_workspace["id"]

        response = await client.put(
            f"/api/workspaces/{workspace_id}",
            json={"description": "New description"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "New description"

    async def test_update_workspace_not_found(self, client):
        """Test updating non-existent workspace returns 404."""
        response = await client.put(
            "/api/workspaces/nonexistent-id",
            json={"name": "New Name"}
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestDeleteWorkspace:
    """Tests for DELETE /api/workspaces/{workspace_id}."""

    async def test_delete_workspace(self, client, test_workspace):
        """Test deleting a workspace."""
        workspace_id = test_workspace["id"]

        response = await client.delete(f"/api/workspaces/{workspace_id}")

        assert response.status_code == 204

        # Verify it's deleted
        get_response = await client.get(f"/api/workspaces/{workspace_id}")
        assert get_response.status_code == 404

    async def test_delete_workspace_not_found(self, client):
        """Test deleting non-existent workspace returns 404."""
        response = await client.delete("/api/workspaces/nonexistent-id")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestExportWorkspace:
    """Tests for GET /api/workspaces/{workspace_id}/export."""

    async def test_export_workspace(self, client, test_workspace):
        """Test exporting a workspace."""
        workspace_id = test_workspace["id"]

        response = await client.get(f"/api/workspaces/{workspace_id}/export")

        assert response.status_code == 200
        data = response.json()

        assert "name" in data
        assert "description" in data
        assert "pages" in data
        assert data["name"] == "Test Workspace"

    async def test_export_workspace_not_found(self, client):
        """Test exporting non-existent workspace returns 404."""
        response = await client.get("/api/workspaces/nonexistent-id/export")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestImportWorkspace:
    """Tests for POST /api/workspaces/import."""

    async def test_import_workspace(self, client):
        """Test importing a workspace."""
        now = datetime.now(timezone.utc).isoformat()
        export_data = {
            "name": "Imported Workspace",
            "description": "An imported workspace",
            "pages": [
                {
                    "id": "temp-page-id",
                    "name": "Imported Page",
                    "nodes": [{"id": "node1", "type": "source"}],
                    "edges": [],
                    "created_at": now,
                    "updated_at": now
                }
            ]
        }

        response = await client.post(
            "/api/workspaces/import",
            json=export_data
        )

        assert response.status_code == 201
        data = response.json()

        assert "Imported" in data["name"]
        assert len(data["pages"]) == 1
        assert data["pages"][0]["name"] == "Imported Page"

    async def test_import_workspace_empty_pages(self, client):
        """Test importing workspace with no pages creates default."""
        export_data = {
            "name": "Empty Workspace",
            "pages": []
        }

        response = await client.post(
            "/api/workspaces/import",
            json=export_data
        )

        assert response.status_code == 201
        data = response.json()

        # Should create default page
        assert len(data["pages"]) == 1
        assert data["pages"][0]["name"] == "Page 1"

    async def test_import_workspace_preserves_nodes_edges(self, client):
        """Test that import preserves nodes and edges."""
        now = datetime.now(timezone.utc).isoformat()
        export_data = {
            "name": "Complex Workspace",
            "pages": [
                {
                    "id": "temp-page-id",
                    "name": "Page 1",
                    "nodes": [
                        {"id": "1", "type": "source", "data": {"label": "CSV"}},
                        {"id": "2", "type": "transform", "data": {"label": "Filter"}}
                    ],
                    "edges": [
                        {"id": "e1", "source": "1", "target": "2"}
                    ],
                    "created_at": now,
                    "updated_at": now
                }
            ]
        }

        response = await client.post(
            "/api/workspaces/import",
            json=export_data
        )

        assert response.status_code == 201
        data = response.json()

        page = data["pages"][0]
        assert len(page["nodes"]) == 2
        assert len(page["edges"]) == 1
