"""
API tests for app/routers/dags.py
"""
import pytest


@pytest.mark.asyncio
class TestListDags:
    """Tests for GET /dags/workspace/{workspace_id}."""

    async def test_list_dags_empty(self, client, test_workspace):
        """Test listing DAGs when none exist."""
        workspace_id = test_workspace["id"]

        response = await client.get(f"/dags/workspace/{workspace_id}")

        assert response.status_code == 200
        data = response.json()
        assert "dags" in data
        assert "total" in data
        assert data["total"] == 0

    async def test_list_dags_workspace_not_found(self, client):
        """Test listing DAGs for non-existent workspace."""
        response = await client.get("/dags/workspace/nonexistent")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestCreateDag:
    """Tests for POST /dags/workspace/{workspace_id}."""

    async def test_create_dag(self, client, test_workspace):
        """Test creating a DAG definition."""
        workspace_id = test_workspace["id"]
        page_id = test_workspace["pages"][0]["id"]

        response = await client.post(
            f"/dags/workspace/{workspace_id}",
            json={
                "page_id": page_id,
                "dag_id": "test_dag",
                "name": "Test DAG",
                "description": "A test DAG",
                "dag_config": {
                    "schedule_interval": "@daily",
                    "start_date": "2024-01-01"
                },
                "tasks": [
                    {"task_id": "task1", "operator": "SparkSubmitOperator"}
                ],
                "edges": [],
                "generated_code": "# DAG code here"
            }
        )

        assert response.status_code == 201
        data = response.json()

        assert data["dag_id"] == "test_dag"
        assert data["name"] == "Test DAG"
        assert data["is_active"] is True

    async def test_create_dag_duplicate_id(self, client, test_workspace):
        """Test creating DAG with duplicate dag_id fails."""
        workspace_id = test_workspace["id"]
        page_id = test_workspace["pages"][0]["id"]

        # Create first DAG
        await client.post(
            f"/dags/workspace/{workspace_id}",
            json={
                "page_id": page_id,
                "dag_id": "duplicate_test",
                "name": "First DAG",
                "tasks": [],
                "edges": []
            }
        )

        # Try to create with same dag_id
        response = await client.post(
            f"/dags/workspace/{workspace_id}",
            json={
                "page_id": page_id,
                "dag_id": "duplicate_test",
                "name": "Second DAG",
                "tasks": [],
                "edges": []
            }
        )

        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    async def test_create_dag_workspace_not_found(self, client):
        """Test creating DAG in non-existent workspace."""
        response = await client.post(
            "/dags/workspace/nonexistent",
            json={
                "page_id": "some-page",
                "dag_id": "test",
                "name": "Test",
                "tasks": [],
                "edges": []
            }
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestGetDag:
    """Tests for GET /dags/{dag_id}."""

    async def test_get_dag(self, client, test_workspace):
        """Test getting a DAG by ID."""
        workspace_id = test_workspace["id"]
        page_id = test_workspace["pages"][0]["id"]

        # Create DAG
        create_response = await client.post(
            f"/dags/workspace/{workspace_id}",
            json={
                "page_id": page_id,
                "dag_id": "get_test",
                "name": "Get Test DAG",
                "tasks": [],
                "edges": []
            }
        )
        dag_id = create_response.json()["id"]

        # Get it
        response = await client.get(f"/dags/{dag_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == dag_id
        assert data["dag_id"] == "get_test"

    async def test_get_dag_not_found(self, client):
        """Test getting non-existent DAG."""
        response = await client.get("/dags/nonexistent")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestGetDagByPage:
    """Tests for GET /dags/by-page/{page_id}."""

    async def test_get_dag_by_page(self, client, test_workspace):
        """Test getting DAG by page ID."""
        workspace_id = test_workspace["id"]
        page_id = test_workspace["pages"][0]["id"]

        # Create DAG for the page
        await client.post(
            f"/dags/workspace/{workspace_id}",
            json={
                "page_id": page_id,
                "dag_id": "page_dag",
                "name": "Page DAG",
                "tasks": [],
                "edges": []
            }
        )

        # Get by page ID
        response = await client.get(f"/dags/by-page/{page_id}")

        assert response.status_code == 200
        assert response.json()["dag_id"] == "page_dag"

    async def test_get_dag_by_page_not_found(self, client, test_workspace):
        """Test getting DAG for page with no DAG."""
        # Create a new page without a DAG
        workspace_id = test_workspace["id"]
        page_response = await client.post(
            f"/api/workspaces/{workspace_id}/pages",
            json={"name": "Empty Page"}
        )
        page_id = page_response.json()["id"]

        response = await client.get(f"/dags/by-page/{page_id}")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestUpdateDag:
    """Tests for PUT /dags/{dag_id}."""

    async def test_update_dag(self, client, test_workspace):
        """Test updating a DAG."""
        workspace_id = test_workspace["id"]
        page_id = test_workspace["pages"][0]["id"]

        # Create DAG
        create_response = await client.post(
            f"/dags/workspace/{workspace_id}",
            json={
                "page_id": page_id,
                "dag_id": "update_test",
                "name": "Original Name",
                "tasks": [],
                "edges": []
            }
        )
        dag_id = create_response.json()["id"]

        # Update
        response = await client.put(
            f"/dags/{dag_id}",
            json={"name": "Updated Name", "description": "New description"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["description"] == "New description"
        assert data["version"] == 2  # Version incremented

    async def test_update_dag_not_found(self, client):
        """Test updating non-existent DAG."""
        response = await client.put(
            "/dags/nonexistent",
            json={"name": "New Name"}
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestDeleteDag:
    """Tests for DELETE /dags/{dag_id}."""

    async def test_delete_dag(self, client, test_workspace):
        """Test deleting a DAG."""
        workspace_id = test_workspace["id"]
        page_id = test_workspace["pages"][0]["id"]

        # Create DAG
        create_response = await client.post(
            f"/dags/workspace/{workspace_id}",
            json={
                "page_id": page_id,
                "dag_id": "delete_test",
                "name": "To Delete",
                "tasks": [],
                "edges": []
            }
        )
        dag_id = create_response.json()["id"]

        # Delete
        response = await client.delete(f"/dags/{dag_id}")

        assert response.status_code == 204

        # Verify deleted
        get_response = await client.get(f"/dags/{dag_id}")
        assert get_response.status_code == 404

    async def test_delete_dag_not_found(self, client):
        """Test deleting non-existent DAG."""
        response = await client.delete("/dags/nonexistent")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestTriggerDag:
    """Tests for POST /dags/{dag_id}/trigger."""

    async def test_trigger_dag(self, client, test_workspace):
        """Test triggering a DAG execution."""
        workspace_id = test_workspace["id"]
        page_id = test_workspace["pages"][0]["id"]

        # Create DAG
        create_response = await client.post(
            f"/dags/workspace/{workspace_id}",
            json={
                "page_id": page_id,
                "dag_id": "trigger_test",
                "name": "Trigger Test",
                "tasks": [],
                "edges": []
            }
        )
        dag_id = create_response.json()["id"]

        # Trigger
        response = await client.post(f"/dags/{dag_id}/trigger")

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "pending"
        assert data["triggered_by"] == "manual"

    async def test_trigger_dag_not_found(self, client):
        """Test triggering non-existent DAG."""
        response = await client.post("/dags/nonexistent/trigger")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestListExecutions:
    """Tests for GET /dags/{dag_id}/executions."""

    async def test_list_executions(self, client, test_workspace):
        """Test listing DAG executions."""
        workspace_id = test_workspace["id"]
        page_id = test_workspace["pages"][0]["id"]

        # Create DAG
        create_response = await client.post(
            f"/dags/workspace/{workspace_id}",
            json={
                "page_id": page_id,
                "dag_id": "exec_test",
                "name": "Execution Test",
                "tasks": [],
                "edges": []
            }
        )
        dag_id = create_response.json()["id"]

        # Trigger some executions
        await client.post(f"/dags/{dag_id}/trigger")
        await client.post(f"/dags/{dag_id}/trigger")

        # List executions
        response = await client.get(f"/dags/{dag_id}/executions")

        assert response.status_code == 200
        data = response.json()
        assert "executions" in data
        assert "total" in data
        assert data["total"] >= 2

    async def test_list_executions_dag_not_found(self, client):
        """Test listing executions for non-existent DAG."""
        response = await client.get("/dags/nonexistent/executions")

        assert response.status_code == 404
