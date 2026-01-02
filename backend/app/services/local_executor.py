"""
Local mode Spark executor using subprocess.
"""
import asyncio
import tempfile
import os
import sys
from typing import Optional, Dict, Any, Callable
from datetime import datetime, timezone

from .executor_base import BaseExecutor, ExecutionResult, ExecutionStatus


class LocalExecutor(BaseExecutor):
    """
    Execute PySpark code in local mode using subprocess.

    This executor:
    1. Writes the code to a temporary file
    2. Runs spark-submit or python with pyspark in subprocess
    3. Streams stdout/stderr back as logs
    4. Supports cancellation by killing the subprocess
    """

    @property
    def executor_type(self) -> str:
        return "local"

    async def execute(
        self,
        code: str,
        on_log: Optional[Callable[[str], None]] = None
    ) -> ExecutionResult:
        """Execute PySpark code locally."""
        self._cancelled = False
        logs = []

        def log(msg: str):
            logs.append(msg)
            if on_log:
                on_log(msg)

        # Create temp file for the code
        temp_file = None
        try:
            temp_file = tempfile.NamedTemporaryFile(
                mode='w',
                suffix='.py',
                delete=False,
                encoding='utf-8'
            )
            temp_file.write(code)
            temp_file.close()

            log(f"[{datetime.now(timezone.utc).isoformat()}] Starting local Spark execution...")
            log(f"[{datetime.now(timezone.utc).isoformat()}] Master: {self.master_url or 'local[*]'}")

            # Build command
            # Try spark-submit first, fallback to python
            master = self.master_url or "local[*]"

            # Check if spark-submit is available
            spark_submit = self._find_spark_submit()

            if spark_submit:
                cmd = [
                    spark_submit,
                    "--master", master,
                ]
                # Add config options
                for key, value in self.config.items():
                    cmd.extend(["--conf", f"{key}={value}"])
                cmd.append(temp_file.name)
            else:
                # Fallback to running with python directly
                # PySpark should be installed and will use local mode
                cmd = [sys.executable, temp_file.name]
                log(f"[{datetime.now(timezone.utc).isoformat()}] spark-submit not found, using python with PySpark")

            log(f"[{datetime.now(timezone.utc).isoformat()}] Command: {' '.join(cmd)}")
            log("")

            # Run subprocess
            self._process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                env=self._get_spark_env()
            )

            # Stream output
            while True:
                if self._cancelled:
                    self._process.kill()
                    await self._process.wait()
                    log(f"\n[{datetime.now(timezone.utc).isoformat()}] Execution cancelled by user")
                    return ExecutionResult(
                        status=ExecutionStatus.CANCELLED,
                        logs="\n".join(logs),
                        error_message="Cancelled by user"
                    )

                line = await self._process.stdout.readline()
                if not line:
                    break

                decoded = line.decode('utf-8', errors='replace').rstrip()
                log(decoded)

            # Wait for completion
            await self._process.wait()
            exit_code = self._process.returncode

            log(f"\n[{datetime.now(timezone.utc).isoformat()}] Execution completed with exit code: {exit_code}")

            if exit_code == 0:
                return ExecutionResult(
                    status=ExecutionStatus.SUCCESS,
                    logs="\n".join(logs)
                )
            else:
                return ExecutionResult(
                    status=ExecutionStatus.FAILED,
                    logs="\n".join(logs),
                    error_message=f"Process exited with code {exit_code}"
                )

        except Exception as e:
            log(f"\n[{datetime.now(timezone.utc).isoformat()}] Error: {str(e)}")
            return ExecutionResult(
                status=ExecutionStatus.FAILED,
                logs="\n".join(logs),
                error_message=str(e)
            )
        finally:
            # Cleanup temp file
            if temp_file and os.path.exists(temp_file.name):
                try:
                    os.unlink(temp_file.name)
                except OSError:
                    pass  # File already deleted or permission issue
            self._process = None

    async def cancel(self) -> bool:
        """Cancel the running execution."""
        self._cancelled = True
        if self._process:
            try:
                self._process.kill()
                return True
            except ProcessLookupError:
                pass  # Process already terminated
        return False

    async def test_connection(self) -> Dict[str, Any]:
        """Test local Spark availability."""
        spark_submit = self._find_spark_submit()

        # Check if PySpark is importable
        try:
            import pyspark
            pyspark_version = pyspark.__version__
            pyspark_available = True
        except ImportError:
            pyspark_version = None
            pyspark_available = False

        if spark_submit or pyspark_available:
            return {
                "success": True,
                "message": "Local Spark mode is available",
                "details": {
                    "master": self.master_url or "local[*]",
                    "spark_submit": spark_submit,
                    "pyspark_version": pyspark_version,
                }
            }
        else:
            return {
                "success": False,
                "message": "Neither spark-submit nor PySpark found",
                "details": {}
            }

    def _find_spark_submit(self) -> Optional[str]:
        """Find spark-submit executable."""
        import shutil

        # Check SPARK_HOME
        spark_home = os.environ.get('SPARK_HOME')
        if spark_home:
            spark_submit = os.path.join(spark_home, 'bin', 'spark-submit')
            if os.path.exists(spark_submit):
                return spark_submit
            # Windows
            spark_submit = os.path.join(spark_home, 'bin', 'spark-submit.cmd')
            if os.path.exists(spark_submit):
                return spark_submit

        # Check PATH
        spark_submit = shutil.which('spark-submit')
        if spark_submit:
            return spark_submit

        return None

    def _get_spark_env(self) -> Dict[str, str]:
        """Get environment variables for Spark execution."""
        env = os.environ.copy()

        # Set PYSPARK_PYTHON to current Python
        env['PYSPARK_PYTHON'] = sys.executable
        env['PYSPARK_DRIVER_PYTHON'] = sys.executable

        # Add any config-based env vars
        if 'SPARK_HOME' in self.config:
            env['SPARK_HOME'] = self.config['SPARK_HOME']

        return env
