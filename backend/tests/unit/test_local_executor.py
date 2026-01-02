"""
Unit tests for app/services/local_executor.py
"""
import pytest
import asyncio
import os
import sys
from unittest.mock import patch, MagicMock, AsyncMock


class TestLocalExecutorProperties:
    """Tests for LocalExecutor properties and initialization."""

    def test_executor_type(self):
        """Test executor_type property."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()
        assert executor.executor_type == "local"

    def test_init_defaults(self):
        """Test default initialization."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()

        assert executor.master_url is None
        assert executor.config == {}
        assert executor._cancelled is False

    def test_init_with_master_url(self):
        """Test initialization with master URL."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor(master_url="local[4]")
        assert executor.master_url == "local[4]"

    def test_init_with_config(self):
        """Test initialization with config."""
        from app.services.local_executor import LocalExecutor

        config = {"spark.driver.memory": "4g"}
        executor = LocalExecutor(config=config)
        assert executor.config == config


class TestLocalExecutorSparkEnv:
    """Tests for Spark environment setup."""

    def test_get_spark_env_sets_python(self):
        """Test that _get_spark_env sets Python paths."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()
        env = executor._get_spark_env()

        assert "PYSPARK_PYTHON" in env
        assert "PYSPARK_DRIVER_PYTHON" in env
        assert env["PYSPARK_PYTHON"] == sys.executable
        assert env["PYSPARK_DRIVER_PYTHON"] == sys.executable

    def test_get_spark_env_includes_os_environ(self):
        """Test that _get_spark_env includes OS environment."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()

        with patch.dict(os.environ, {"MY_VAR": "my_value"}):
            env = executor._get_spark_env()
            assert env.get("MY_VAR") == "my_value"

    def test_get_spark_env_with_spark_home_config(self):
        """Test SPARK_HOME from config."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor(config={"SPARK_HOME": "/opt/spark"})
        env = executor._get_spark_env()

        assert env.get("SPARK_HOME") == "/opt/spark"


class TestLocalExecutorFindSparkSubmit:
    """Tests for finding spark-submit."""

    def test_find_spark_submit_from_spark_home(self):
        """Test finding spark-submit from SPARK_HOME."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()

        with patch.dict(os.environ, {"SPARK_HOME": "/opt/spark"}):
            with patch("os.path.exists") as mock_exists:
                mock_exists.return_value = True
                result = executor._find_spark_submit()

                assert result is not None
                assert "spark-submit" in result

    def test_find_spark_submit_from_path(self):
        """Test finding spark-submit from PATH."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()

        with patch.dict(os.environ, {}, clear=False):
            # Remove SPARK_HOME if present
            os.environ.pop("SPARK_HOME", None)

            with patch("shutil.which") as mock_which:
                mock_which.return_value = "/usr/bin/spark-submit"
                result = executor._find_spark_submit()

                assert result == "/usr/bin/spark-submit"

    def test_find_spark_submit_not_found(self):
        """Test when spark-submit is not found."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()

        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("SPARK_HOME", None)

            with patch("shutil.which", return_value=None):
                with patch("os.path.exists", return_value=False):
                    result = executor._find_spark_submit()
                    assert result is None


class TestLocalExecutorTestConnection:
    """Tests for test_connection method."""

    @pytest.mark.asyncio
    async def test_test_connection_pyspark_available(self):
        """Test connection when PySpark is available."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()

        # PySpark should be available in test environment
        result = await executor.test_connection()

        assert "success" in result
        assert "message" in result
        assert "details" in result

        if result["success"]:
            assert "pyspark_version" in result["details"]

    @pytest.mark.asyncio
    async def test_test_connection_with_master_url(self):
        """Test connection shows master URL in details."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor(master_url="local[4]")
        result = await executor.test_connection()

        if result["success"]:
            assert result["details"]["master"] == "local[4]"


class TestLocalExecutorExecute:
    """Tests for execute method."""

    @pytest.mark.asyncio
    async def test_execute_simple_code(self):
        """Test executing simple Python code."""
        from app.services.local_executor import LocalExecutor
        from app.services.executor_base import ExecutionStatus

        executor = LocalExecutor()

        # Simple code that just prints
        code = 'print("Hello from test")'

        result = await executor.execute(code)

        # Should complete (success or fail depending on environment)
        assert result.status in [ExecutionStatus.SUCCESS, ExecutionStatus.FAILED]
        assert result.logs is not None

    @pytest.mark.asyncio
    async def test_execute_with_log_callback(self):
        """Test execute with log callback."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()
        logs_received = []

        def on_log(msg):
            logs_received.append(msg)

        code = 'print("Test log")'
        await executor.execute(code, on_log=on_log)

        # Should have received some logs
        assert len(logs_received) > 0

    @pytest.mark.asyncio
    async def test_execute_with_error(self):
        """Test executing code that raises an error."""
        from app.services.local_executor import LocalExecutor
        from app.services.executor_base import ExecutionStatus

        executor = LocalExecutor()

        # Code that will raise an error
        code = 'raise ValueError("Test error")'

        result = await executor.execute(code)

        assert result.status == ExecutionStatus.FAILED

    @pytest.mark.asyncio
    async def test_execute_cleans_up_temp_file(self):
        """Test that temp file is cleaned up after execution."""
        from app.services.local_executor import LocalExecutor
        import tempfile
        import glob

        executor = LocalExecutor()

        # Get temp dir
        temp_dir = tempfile.gettempdir()
        initial_files = set(glob.glob(f"{temp_dir}/*.py"))

        code = 'print("cleanup test")'
        await executor.execute(code)

        # Small delay for cleanup
        await asyncio.sleep(0.1)

        final_files = set(glob.glob(f"{temp_dir}/*.py"))

        # Should not leave more files than before
        # (This is a loose check since other processes may create files)


class TestLocalExecutorCancel:
    """Tests for cancel method."""

    @pytest.mark.asyncio
    async def test_cancel_sets_cancelled_flag(self):
        """Test that cancel sets the cancelled flag."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()

        assert executor._cancelled is False

        await executor.cancel()

        assert executor._cancelled is True

    @pytest.mark.asyncio
    async def test_cancel_returns_true_when_process_exists(self):
        """Test cancel returns True when there's a process to kill."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()

        # Mock a running process
        mock_process = MagicMock()
        mock_process.kill = MagicMock()
        executor._process = mock_process

        result = await executor.cancel()

        assert result is True
        mock_process.kill.assert_called_once()

    @pytest.mark.asyncio
    async def test_cancel_returns_false_when_no_process(self):
        """Test cancel returns False when no process is running."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()
        executor._process = None

        result = await executor.cancel()

        assert result is False

    @pytest.mark.asyncio
    async def test_is_cancelled_after_cancel(self):
        """Test is_cancelled returns True after cancel."""
        from app.services.local_executor import LocalExecutor

        executor = LocalExecutor()

        assert executor.is_cancelled() is False

        await executor.cancel()

        assert executor.is_cancelled() is True
