"""
Livy REST API executor for remote Spark execution.
"""
import asyncio
from typing import Optional, Dict, Any, Callable
from datetime import datetime
import httpx

from .executor_base import BaseExecutor, ExecutionResult, ExecutionStatus


class LivyExecutor(BaseExecutor):
    """
    Execute PySpark code via Apache Livy REST API.

    Livy provides a REST interface to Spark, allowing:
    - Session-based execution (interactive)
    - Batch job submission
    - Works with any Spark cluster (YARN, Mesos, Kubernetes, Standalone)

    API Reference: https://livy.incubator.apache.org/docs/latest/rest-api.html
    """

    POLL_INTERVAL = 1.0  # seconds between status polls
    SESSION_WAIT_TIMEOUT = 120  # seconds to wait for session to be ready
    STATEMENT_TIMEOUT = 3600  # 1 hour max for statement execution

    @property
    def executor_type(self) -> str:
        return "livy"

    async def execute(
        self,
        code: str,
        on_log: Optional[Callable[[str], None]] = None
    ) -> ExecutionResult:
        """Execute PySpark code via Livy."""
        self._cancelled = False
        logs = []

        def log(msg: str):
            timestamp = datetime.utcnow().isoformat()
            formatted = f"[{timestamp}] {msg}"
            logs.append(formatted)
            if on_log:
                on_log(formatted)

        if not self.master_url:
            return ExecutionResult(
                status=ExecutionStatus.FAILED,
                logs="",
                error_message="Livy URL not configured"
            )

        livy_url = self.master_url.rstrip('/')

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                # Step 1: Create or reuse session
                log(f"Connecting to Livy at {livy_url}")
                session_id = await self._get_or_create_session(client, livy_url, log)

                if self._cancelled:
                    return self._cancelled_result(logs)

                self._session_id = session_id
                log(f"Using Livy session {session_id}")

                # Step 2: Submit statement
                log("Submitting code for execution...")
                stmt_response = await client.post(
                    f"{livy_url}/sessions/{session_id}/statements",
                    json={"code": code}
                )
                stmt_response.raise_for_status()
                statement = stmt_response.json()
                statement_id = statement["id"]
                log(f"Statement {statement_id} submitted")

                # Step 3: Poll for completion
                elapsed = 0
                while elapsed < self.STATEMENT_TIMEOUT:
                    if self._cancelled:
                        # Cancel the statement
                        await client.post(
                            f"{livy_url}/sessions/{session_id}/statements/{statement_id}/cancel"
                        )
                        return self._cancelled_result(logs)

                    status_response = await client.get(
                        f"{livy_url}/sessions/{session_id}/statements/{statement_id}"
                    )
                    status_response.raise_for_status()
                    stmt_status = status_response.json()

                    state = stmt_status.get("state", "unknown")

                    if state == "available":
                        # Execution complete
                        output = stmt_status.get("output", {})
                        output_status = output.get("status", "ok")

                        if output_status == "ok":
                            # Success
                            data = output.get("data", {})
                            text_output = data.get("text/plain", "")
                            log(f"Execution completed successfully")
                            if text_output:
                                log(f"Output:\n{text_output}")
                            return ExecutionResult(
                                status=ExecutionStatus.SUCCESS,
                                logs="\n".join(logs),
                                output=text_output
                            )
                        else:
                            # Error
                            error_value = output.get("evalue", "Unknown error")
                            traceback = output.get("traceback", [])
                            error_msg = f"{error_value}\n{''.join(traceback)}"
                            log(f"Execution failed: {error_value}")
                            return ExecutionResult(
                                status=ExecutionStatus.FAILED,
                                logs="\n".join(logs),
                                error_message=error_msg
                            )

                    elif state == "error":
                        log(f"Statement error")
                        return ExecutionResult(
                            status=ExecutionStatus.FAILED,
                            logs="\n".join(logs),
                            error_message="Statement execution error"
                        )

                    elif state == "cancelled":
                        log("Statement was cancelled")
                        return self._cancelled_result(logs)

                    elif state in ("waiting", "running"):
                        # Still running, continue polling
                        progress = stmt_status.get("progress", 0)
                        log(f"Status: {state}, Progress: {progress:.1%}")
                        await asyncio.sleep(self.POLL_INTERVAL)
                        elapsed += self.POLL_INTERVAL
                    else:
                        log(f"Unknown state: {state}")
                        await asyncio.sleep(self.POLL_INTERVAL)
                        elapsed += self.POLL_INTERVAL

                # Timeout
                log("Execution timed out")
                return ExecutionResult(
                    status=ExecutionStatus.FAILED,
                    logs="\n".join(logs),
                    error_message="Execution timed out"
                )

        except httpx.HTTPStatusError as e:
            log(f"HTTP Error: {e.response.status_code}")
            return ExecutionResult(
                status=ExecutionStatus.FAILED,
                logs="\n".join(logs),
                error_message=f"HTTP {e.response.status_code}: {e.response.text}"
            )
        except Exception as e:
            log(f"Error: {str(e)}")
            return ExecutionResult(
                status=ExecutionStatus.FAILED,
                logs="\n".join(logs),
                error_message=str(e)
            )

    async def cancel(self) -> bool:
        """Cancel execution by deleting the Livy session."""
        self._cancelled = True

        if self._session_id and self.master_url:
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    livy_url = self.master_url.rstrip('/')
                    await client.delete(f"{livy_url}/sessions/{self._session_id}")
                    self._session_id = None
                    return True
            except:
                pass
        return False

    async def test_connection(self) -> Dict[str, Any]:
        """Test Livy connection."""
        if not self.master_url:
            return {
                "success": False,
                "message": "Livy URL not configured"
            }

        livy_url = self.master_url.rstrip('/')

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                # Check Livy is responding
                response = await client.get(f"{livy_url}/sessions")

                if response.status_code == 200:
                    sessions = response.json()
                    return {
                        "success": True,
                        "message": "Livy connection successful",
                        "details": {
                            "url": livy_url,
                            "active_sessions": len(sessions.get("sessions", []))
                        }
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Livy returned status {response.status_code}"
                    }
        except httpx.ConnectError:
            return {
                "success": False,
                "message": f"Cannot connect to Livy at {livy_url}"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection error: {str(e)}"
            }

    async def _get_or_create_session(
        self,
        client: httpx.AsyncClient,
        livy_url: str,
        log: Callable[[str], None]
    ) -> int:
        """Get an existing idle session or create a new one."""
        # Check for existing idle sessions
        response = await client.get(f"{livy_url}/sessions")
        response.raise_for_status()
        sessions = response.json().get("sessions", [])

        for session in sessions:
            if session.get("state") == "idle":
                return session["id"]

        # Create new session
        log("Creating new Livy session...")
        session_config = {
            "kind": "pyspark",
            "name": "etlab-session",
        }

        # Add any custom config
        if self.config.get("driverMemory"):
            session_config["driverMemory"] = self.config["driverMemory"]
        if self.config.get("executorMemory"):
            session_config["executorMemory"] = self.config["executorMemory"]
        if self.config.get("executorCores"):
            session_config["executorCores"] = self.config["executorCores"]
        if self.config.get("numExecutors"):
            session_config["numExecutors"] = self.config["numExecutors"]

        create_response = await client.post(
            f"{livy_url}/sessions",
            json=session_config
        )
        create_response.raise_for_status()
        session = create_response.json()
        session_id = session["id"]

        # Wait for session to be ready
        log(f"Waiting for session {session_id} to be ready...")
        elapsed = 0
        while elapsed < self.SESSION_WAIT_TIMEOUT:
            if self._cancelled:
                # Delete the session
                await client.delete(f"{livy_url}/sessions/{session_id}")
                raise Exception("Cancelled while waiting for session")

            status_response = await client.get(f"{livy_url}/sessions/{session_id}")
            status_response.raise_for_status()
            state = status_response.json().get("state")

            if state == "idle":
                log("Session is ready")
                return session_id
            elif state == "error" or state == "dead":
                raise Exception(f"Session failed with state: {state}")
            else:
                log(f"Session state: {state}")
                await asyncio.sleep(2)
                elapsed += 2

        raise Exception("Timeout waiting for session to be ready")

    def _cancelled_result(self, logs: list) -> ExecutionResult:
        """Return a cancelled result."""
        logs.append(f"[{datetime.utcnow().isoformat()}] Execution cancelled by user")
        return ExecutionResult(
            status=ExecutionStatus.CANCELLED,
            logs="\n".join(logs),
            error_message="Cancelled by user"
        )
