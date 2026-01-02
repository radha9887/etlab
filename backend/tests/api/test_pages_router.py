"""
API tests for app/routers/pages.py
"""
import pytest


@pytest.mark.asyncio
class TestListPages:
    """Tests for GET /api/workspaces/{workspace_id}/pages."""

    async def test_list_pages(self, client, test_workspace):
        """Test listing pages in a workspace."""
        workspace_id = test_workspace["id"]

        response = await client.get(f"/api/workspaces/{workspace_id}/pages")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) >= 1  # Default page created with workspace

        page = data[0]
        assert "id" in page
        assert "name" in page
        assert "node_count" in page
        assert "edge_count" in page

    async def test_list_pages_workspace_not_found(self, client):
        """Test listing pages for non-existent workspace."""
        response = await client.get("/api/workspaces/nonexistent/pages")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestCreatePage:
    """Tests for POST /api/workspaces/{workspace_id}/pages."""

    async def test_create_page(self, client, test_workspace):
        """Test creating a new page."""
        workspace_id = test_workspace["id"]

        response = await client.post(
            f"/api/workspaces/{workspace_id}/pages",
            json={"name": "New Page"}
        )

        assert response.status_code == 201
        data = response.json()

        assert data["name"] == "New Page"
        assert data["workspace_id"] == workspace_id
        assert data["nodes"] == []
        assert data["edges"] == []

    async def test_create_page_with_nodes(self, client, test_workspace):
        """Test creating page with nodes."""
        workspace_id = test_workspace["id"]

        nodes = [
            {"id": "1", "type": "source", "data": {"label": "CSV Source"}},
            {"id": "2", "type": "transform", "data": {"label": "Filter"}}
        ]

        response = await client.post(
            f"/api/workspaces/{workspace_id}/pages",
            json={
                "name": "Page with Nodes",
                "nodes": nodes
            }
        )

        assert response.status_code == 201
        data = response.json()

        assert len(data["nodes"]) == 2

    async def test_create_page_with_edges(self, client, test_workspace):
        """Test creating page with edges."""
        workspace_id = test_workspace["id"]

        response = await client.post(
            f"/api/workspaces/{workspace_id}/pages",
            json={
                "name": "Page with Edges",
                "nodes": [{"id": "1"}, {"id": "2"}],
                "edges": [{"id": "e1", "source": "1", "target": "2"}]
            }
        )

        assert response.status_code == 201
        data = response.json()

        assert len(data["edges"]) == 1

    async def test_create_page_workspace_not_found(self, client):
        """Test creating page in non-existent workspace."""
        response = await client.post(
            "/api/workspaces/nonexistent/pages",
            json={"name": "New Page"}
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestGetPage:
    """Tests for GET /api/pages/{page_id}."""

    async def test_get_page(self, client, test_workspace):
        """Test getting a page by ID."""
        # Get the default page from workspace
        page_id = test_workspace["pages"][0]["id"]

        response = await client.get(f"/api/pages/{page_id}")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == page_id
        assert "name" in data
        assert "nodes" in data
        assert "edges" in data
        assert "workspace_id" in data

    async def test_get_page_not_found(self, client):
        """Test getting non-existent page."""
        response = await client.get("/api/pages/nonexistent")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestUpdatePage:
    """Tests for PUT /api/pages/{page_id}."""

    async def test_update_page_name(self, client, test_workspace):
        """Test updating page name."""
        page_id = test_workspace["pages"][0]["id"]

        response = await client.put(
            f"/api/pages/{page_id}",
            json={"name": "Updated Page Name"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Page Name"

    async def test_update_page_nodes(self, client, test_workspace):
        """Test updating page nodes."""
        page_id = test_workspace["pages"][0]["id"]

        nodes = [
            {"id": "n1", "type": "source"},
            {"id": "n2", "type": "sink"}
        ]

        response = await client.put(
            f"/api/pages/{page_id}",
            json={"nodes": nodes}
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["nodes"]) == 2

    async def test_update_page_edges(self, client, test_workspace):
        """Test updating page edges."""
        page_id = test_workspace["pages"][0]["id"]

        edges = [{"id": "e1", "source": "n1", "target": "n2"}]

        response = await client.put(
            f"/api/pages/{page_id}",
            json={"edges": edges}
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["edges"]) == 1

    async def test_update_page_not_found(self, client):
        """Test updating non-existent page."""
        response = await client.put(
            "/api/pages/nonexistent",
            json={"name": "New Name"}
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestDeletePage:
    """Tests for DELETE /api/pages/{page_id}."""

    async def test_delete_page(self, client, test_workspace):
        """Test deleting a page."""
        workspace_id = test_workspace["id"]

        # Create a second page first
        create_response = await client.post(
            f"/api/workspaces/{workspace_id}/pages",
            json={"name": "Page to Delete"}
        )
        page_id = create_response.json()["id"]

        # Delete the page
        response = await client.delete(f"/api/pages/{page_id}")

        assert response.status_code == 204

        # Verify it's deleted
        get_response = await client.get(f"/api/pages/{page_id}")
        assert get_response.status_code == 404

    async def test_delete_last_page_fails(self, client, test_workspace):
        """Test that deleting the last page fails."""
        page_id = test_workspace["pages"][0]["id"]

        response = await client.delete(f"/api/pages/{page_id}")

        assert response.status_code == 400
        assert "last page" in response.json()["detail"].lower()

    async def test_delete_page_not_found(self, client):
        """Test deleting non-existent page."""
        response = await client.delete("/api/pages/nonexistent")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestDuplicatePage:
    """Tests for POST /api/pages/{page_id}/duplicate."""

    async def test_duplicate_page(self, client, test_workspace):
        """Test duplicating a page."""
        page_id = test_workspace["pages"][0]["id"]

        response = await client.post(f"/api/pages/{page_id}/duplicate")

        assert response.status_code == 201
        data = response.json()

        assert "(Copy)" in data["name"]
        assert data["id"] != page_id
        assert data["workspace_id"] == test_workspace["id"]

    async def test_duplicate_page_with_nodes(self, client, test_workspace):
        """Test duplicating page preserves nodes with new IDs."""
        workspace_id = test_workspace["id"]

        # Create page with nodes
        create_response = await client.post(
            f"/api/workspaces/{workspace_id}/pages",
            json={
                "name": "Original",
                "nodes": [
                    {"id": "orig1", "type": "source", "data": {"label": "Test"}}
                ]
            }
        )
        page_id = create_response.json()["id"]

        # Duplicate it
        response = await client.post(f"/api/pages/{page_id}/duplicate")

        assert response.status_code == 201
        data = response.json()

        assert len(data["nodes"]) == 1
        # Node ID should be different
        assert data["nodes"][0]["id"] != "orig1"
        # But data should be preserved
        assert data["nodes"][0]["data"]["label"] == "Test"

    async def test_duplicate_page_resets_edges(self, client, test_workspace):
        """Test that duplicating page resets edges."""
        workspace_id = test_workspace["id"]

        # Create page with nodes and edges
        create_response = await client.post(
            f"/api/workspaces/{workspace_id}/pages",
            json={
                "name": "With Edges",
                "nodes": [{"id": "1"}, {"id": "2"}],
                "edges": [{"id": "e1", "source": "1", "target": "2"}]
            }
        )
        page_id = create_response.json()["id"]

        # Duplicate it
        response = await client.post(f"/api/pages/{page_id}/duplicate")

        assert response.status_code == 201
        data = response.json()

        # Edges should be reset since node IDs changed
        assert data["edges"] == []

    async def test_duplicate_page_not_found(self, client):
        """Test duplicating non-existent page."""
        response = await client.post("/api/pages/nonexistent/duplicate")

        assert response.status_code == 404
