"""Airflow integration router for managing Docker Airflow and DAG synchronization."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
import subprocess
import os
import re
import httpx
from pathlib import Path

router = APIRouter(prefix="/api/airflow", tags=["airflow"])

# Configuration - use environment variables when running in Docker
DOCKER_COMPOSE_PATH = Path(__file__).parent.parent.parent.parent / "docker"
AIRFLOW_COMPOSE_FILE = DOCKER_COMPOSE_PATH / "docker-compose.airflow.yml"

# DAGs folder can be overridden via environment variable (for Docker setup)
DAGS_FOLDER = Path(os.environ.get("AIRFLOW_DAGS_PATH", str(DOCKER_COMPOSE_PATH / "airflow" / "dags")))

# Airflow host for internal Docker networking
AIRFLOW_HOST = os.environ.get("AIRFLOW_HOST", "")

# Detect if running in Docker Compose mode (AIRFLOW_HOST points to internal service)
IS_DOCKER_COMPOSE_MODE = AIRFLOW_HOST and not AIRFLOW_HOST.startswith("http://localhost")


class AirflowSettings(BaseModel):
    """Airflow configuration settings."""
    mode: Literal["docker", "external", "compose"] = "docker"
    docker_port: int = 8080
    external_url: Optional[str] = None
    external_username: Optional[str] = None
    external_password: Optional[str] = None
    auto_save: bool = True
    auto_start: bool = False


class AirflowStatus(BaseModel):
    """Airflow status response."""
    status: Literal["stopped", "starting", "running", "error", "unknown"]
    mode: Literal["docker", "external", "compose"]
    url: Optional[str] = None
    message: Optional[str] = None


class DagSyncRequest(BaseModel):
    """Request to sync a DAG file."""
    dag_id: str
    code: str


class DagSyncResponse(BaseModel):
    """Response from DAG sync."""
    success: bool
    file_path: str
    message: str


# In-memory settings (in production, persist to DB)
# Auto-detect mode based on environment
_default_mode = "compose" if IS_DOCKER_COMPOSE_MODE else "docker"
_settings = AirflowSettings(mode=_default_mode)


def sanitize_dag_id(dag_id: str) -> str:
    """Sanitize DAG ID for use as filename."""
    # Replace spaces and special chars with underscores
    sanitized = re.sub(r'[^\w\-]', '_', dag_id.lower())
    # Remove consecutive underscores
    sanitized = re.sub(r'_+', '_', sanitized)
    # Remove leading/trailing underscores
    sanitized = sanitized.strip('_')
    return sanitized or "unnamed_dag"


def check_docker_running() -> bool:
    """Check if Docker is running."""
    try:
        result = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            timeout=10
        )
        return result.returncode == 0
    except Exception:
        return False


def get_container_status() -> str:
    """Get Airflow container status."""
    try:
        result = subprocess.run(
            ["docker", "ps", "-a", "--filter", "name=etlab-airflow", "--format", "{{.Status}}"],
            capture_output=True,
            text=True,
            timeout=10
        )
        status = result.stdout.strip()
        if not status:
            return "stopped"
        if "Up" in status:
            return "running"
        if "Exited" in status:
            return "stopped"
        return "unknown"
    except Exception:
        return "unknown"


async def check_airflow_health(url: str) -> bool:
    """Check if Airflow webserver is healthy."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{url}/health")
            return response.status_code == 200
    except Exception:
        return False


@router.get("/status", response_model=AirflowStatus)
async def get_airflow_status():
    """Get current Airflow status."""

    # Docker Compose mode - check via network
    if IS_DOCKER_COMPOSE_MODE or _settings.mode == "compose":
        is_healthy = await check_airflow_health(AIRFLOW_HOST)
        # For frontend, provide localhost URL since user accesses from browser
        frontend_url = "http://localhost:8080"
        if is_healthy:
            return AirflowStatus(
                status="running",
                mode="compose",
                url=frontend_url
            )
        else:
            return AirflowStatus(
                status="starting",
                mode="compose",
                url=frontend_url,
                message="Airflow is starting up... (may take 60 seconds)"
            )

    # Standalone Docker mode
    if _settings.mode == "docker":
        if not check_docker_running():
            return AirflowStatus(
                status="error",
                mode="docker",
                message="Docker is not running. Please start Docker Desktop."
            )

        container_status = get_container_status()
        url = f"http://localhost:{_settings.docker_port}"

        if container_status == "running":
            # Check if webserver is actually ready
            is_healthy = await check_airflow_health(url)
            if is_healthy:
                return AirflowStatus(
                    status="running",
                    mode="docker",
                    url=url
                )
            else:
                return AirflowStatus(
                    status="starting",
                    mode="docker",
                    url=url,
                    message="Airflow is starting up..."
                )
        else:
            return AirflowStatus(
                status="stopped",
                mode="docker",
                url=url
            )
    else:
        # External mode
        if not _settings.external_url:
            return AirflowStatus(
                status="error",
                mode="external",
                message="External Airflow URL not configured"
            )

        is_healthy = await check_airflow_health(_settings.external_url)
        return AirflowStatus(
            status="running" if is_healthy else "error",
            mode="external",
            url=_settings.external_url,
            message=None if is_healthy else "Cannot connect to external Airflow"
        )


@router.post("/start")
async def start_airflow():
    """Start Airflow Docker container."""
    # In compose mode, Airflow is managed by docker-compose
    if IS_DOCKER_COMPOSE_MODE or _settings.mode == "compose":
        return {
            "success": True,
            "message": "Airflow is managed by Docker Compose. It should already be running.",
            "url": "http://localhost:8080"
        }

    if _settings.mode != "docker":
        raise HTTPException(status_code=400, detail="Airflow is in external mode")

    if not check_docker_running():
        raise HTTPException(status_code=500, detail="Docker is not running")

    if not AIRFLOW_COMPOSE_FILE.exists():
        raise HTTPException(status_code=500, detail="Airflow compose file not found")

    try:
        # Create network if it doesn't exist
        subprocess.run(
            ["docker", "network", "create", "etlab-network"],
            capture_output=True,
            timeout=30
        )

        # Start Airflow
        env = os.environ.copy()
        env["AIRFLOW_PORT"] = str(_settings.docker_port)

        result = subprocess.run(
            ["docker-compose", "-f", str(AIRFLOW_COMPOSE_FILE), "up", "-d"],
            capture_output=True,
            text=True,
            timeout=120,
            env=env,
            cwd=str(DOCKER_COMPOSE_PATH)
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to start Airflow: {result.stderr}"
            )

        return {
            "success": True,
            "message": "Airflow is starting. It may take 30-60 seconds to be ready.",
            "url": f"http://localhost:{_settings.docker_port}"
        }
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Timeout starting Airflow")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop")
async def stop_airflow():
    """Stop Airflow Docker container."""
    # In compose mode, Airflow is managed by docker-compose
    if IS_DOCKER_COMPOSE_MODE or _settings.mode == "compose":
        return {
            "success": False,
            "message": "Airflow is managed by Docker Compose. Use 'docker-compose down' to stop."
        }

    if _settings.mode != "docker":
        raise HTTPException(status_code=400, detail="Airflow is in external mode")

    try:
        result = subprocess.run(
            ["docker-compose", "-f", str(AIRFLOW_COMPOSE_FILE), "down"],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=str(DOCKER_COMPOSE_PATH)
        )

        return {
            "success": result.returncode == 0,
            "message": "Airflow stopped" if result.returncode == 0 else result.stderr
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/settings", response_model=AirflowSettings)
async def get_settings():
    """Get current Airflow settings."""
    return _settings


@router.put("/settings", response_model=AirflowSettings)
async def update_settings(settings: AirflowSettings):
    """Update Airflow settings."""
    global _settings
    _settings = settings
    return _settings


@router.post("/sync", response_model=DagSyncResponse)
async def sync_dag(request: DagSyncRequest):
    """Sync a DAG file to the DAGs folder."""
    try:
        # Ensure DAGs folder exists
        DAGS_FOLDER.mkdir(parents=True, exist_ok=True)

        # Sanitize DAG ID for filename
        safe_dag_id = sanitize_dag_id(request.dag_id)
        file_path = DAGS_FOLDER / f"{safe_dag_id}.py"

        # Write DAG file
        file_path.write_text(request.code, encoding="utf-8")

        return DagSyncResponse(
            success=True,
            file_path=str(file_path),
            message=f"DAG saved to {file_path.name}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync DAG: {str(e)}")


@router.delete("/dag/{dag_id}")
async def delete_dag(dag_id: str):
    """Delete a DAG file."""
    try:
        safe_dag_id = sanitize_dag_id(dag_id)
        file_path = DAGS_FOLDER / f"{safe_dag_id}.py"

        if file_path.exists():
            file_path.unlink()
            return {"success": True, "message": f"Deleted {file_path.name}"}
        else:
            return {"success": False, "message": "DAG file not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dags")
async def list_dags():
    """List all DAG files in the DAGs folder."""
    try:
        if not DAGS_FOLDER.exists():
            return {"dags": []}

        dag_files = [
            {
                "name": f.stem,
                "filename": f.name,
                "modified": f.stat().st_mtime
            }
            for f in DAGS_FOLDER.glob("*.py")
            if not f.name.startswith(".")
        ]

        return {"dags": dag_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class TestConnectionRequest(BaseModel):
    """Request to test Airflow connection."""
    url: str
    username: Optional[str] = None
    password: Optional[str] = None


@router.post("/test-connection")
async def test_connection(request: TestConnectionRequest):
    """Test connection to external Airflow instance using REST API."""
    url = request.url.rstrip('/')

    # Warn if using localhost from Docker
    if 'localhost' in url or '127.0.0.1' in url:
        return {
            "success": False,
            "message": "Cannot reach localhost from Docker. Use host.docker.internal or the actual host IP instead."
        }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Try Airflow 2.x REST API health endpoint (requires auth)
            if request.username and request.password:
                auth = httpx.BasicAuth(request.username, request.password)

                # Try REST API v1 health
                response = await client.get(f"{url}/api/v1/health", auth=auth)
                if response.status_code == 200:
                    data = response.json()
                    scheduler = data.get('scheduler', {}).get('status', 'unknown')
                    return {
                        "success": True,
                        "message": f"Connected (Airflow 2.x API). Scheduler: {scheduler}"
                    }

                # Try getting version info
                response = await client.get(f"{url}/api/v1/version", auth=auth)
                if response.status_code == 200:
                    data = response.json()
                    version = data.get('version', 'unknown')
                    return {
                        "success": True,
                        "message": f"Connected (Airflow {version})"
                    }

            # Try unauthenticated health endpoint (Airflow webserver basic health)
            response = await client.get(f"{url}/health")
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Connected (basic health check). Add credentials for full API access."
                }

            # Check if we get a login page (Airflow is running but needs auth)
            response = await client.get(url)
            if response.status_code == 200 and ('login' in response.text.lower() or 'airflow' in response.text.lower()):
                return {
                    "success": True,
                    "message": "Airflow UI reachable. Add credentials for API access."
                }

            return {"success": False, "message": f"Connection failed: HTTP {response.status_code}"}
    except httpx.TimeoutException:
        return {"success": False, "message": "Connection timeout - Airflow may not be running"}
    except httpx.ConnectError:
        return {"success": False, "message": "Cannot connect - check if Airflow is running and URL is correct"}
    except Exception as e:
        return {"success": False, "message": f"Connection error: {str(e)}"}
