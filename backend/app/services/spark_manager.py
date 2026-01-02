from typing import Optional, Dict, Any
from ..config import get_settings

settings = get_settings()


class SparkManager:
    """Manager for Spark connections and execution."""

    def __init__(self):
        self.default_master = settings.spark_master
        self.app_name = settings.spark_app_name

    async def test_connection(
        self,
        connection_type: str,
        master_url: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Test a Spark connection."""
        if connection_type == "local":
            # Local mode is always available
            return {
                "success": True,
                "message": "Local Spark mode is available",
                "details": {"master": master_url or "local[*]"},
            }

        if connection_type == "livy":
            # Test Livy connection
            return await self._test_livy_connection(master_url, config)

        if connection_type == "standalone":
            # Test standalone cluster
            return {
                "success": False,
                "message": "Standalone cluster testing not yet implemented",
            }

        return {
            "success": False,
            "message": f"Unknown connection type: {connection_type}",
        }

    async def _test_livy_connection(
        self,
        livy_url: Optional[str],
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Test Livy REST API connection."""
        import httpx

        url = livy_url or settings.livy_url
        if not url:
            return {
                "success": False,
                "message": "Livy URL not configured",
            }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{url}/sessions", timeout=10)
                if response.status_code == 200:
                    return {
                        "success": True,
                        "message": "Livy connection successful",
                        "details": {"url": url, "sessions": response.json()},
                    }
                return {
                    "success": False,
                    "message": f"Livy returned status {response.status_code}",
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to connect to Livy: {str(e)}",
            }

    async def execute_code(
        self,
        code: str,
        connection_type: str,
        master_url: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute PySpark code."""
        if connection_type == "local":
            return await self._execute_local(code, master_url, config)

        if connection_type == "livy":
            return await self._execute_livy(code, master_url, config)

        return {
            "success": False,
            "error": f"Execution not implemented for: {connection_type}",
        }

    async def _execute_local(
        self,
        code: str,
        master_url: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute code in local Spark mode."""
        # TODO: Implement local Spark execution
        # This would use subprocess to run pyspark
        return {
            "success": False,
            "error": "Local execution not yet implemented",
        }

    async def _execute_livy(
        self,
        code: str,
        livy_url: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute code via Livy REST API."""
        import httpx

        url = livy_url or settings.livy_url
        if not url:
            return {
                "success": False,
                "error": "Livy URL not configured",
            }

        try:
            async with httpx.AsyncClient() as client:
                # Create session if needed
                session_response = await client.post(
                    f"{url}/sessions",
                    json={"kind": "pyspark"},
                    timeout=30
                )
                session = session_response.json()
                session_id = session["id"]

                # Wait for session to be ready
                # TODO: Implement proper session waiting

                # Submit statement
                stmt_response = await client.post(
                    f"{url}/sessions/{session_id}/statements",
                    json={"code": code},
                    timeout=30
                )

                return {
                    "success": True,
                    "session_id": session_id,
                    "statement": stmt_response.json(),
                }

        except Exception as e:
            return {
                "success": False,
                "error": f"Livy execution failed: {str(e)}",
            }
