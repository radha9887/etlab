"""
Unit tests for app/services/executor_base.py
"""
import pytest
from unittest.mock import MagicMock, AsyncMock


class TestExecutionStatus:
    """Tests for ExecutionStatus enum."""

    def test_execution_status_values(self):
        """Test all status values are defined."""
        from app.services.executor_base import ExecutionStatus

        assert ExecutionStatus.PENDING == "pending"
        assert ExecutionStatus.RUNNING == "running"
        assert ExecutionStatus.SUCCESS == "success"
        assert ExecutionStatus.FAILED == "failed"
        assert ExecutionStatus.CANCELLED == "cancelled"

    def test_execution_status_is_string(self):
        """Test that status values are strings."""
        from app.services.executor_base import ExecutionStatus

        for status in ExecutionStatus:
            assert isinstance(status.value, str)

    def test_execution_status_count(self):
        """Test that we have exactly 5 statuses."""
        from app.services.executor_base import ExecutionStatus

        assert len(ExecutionStatus) == 5


class TestExecutionResult:
    """Tests for ExecutionResult dataclass."""

    def test_execution_result_success(self):
        """Test creating a success result."""
        from app.services.executor_base import ExecutionResult, ExecutionStatus

        result = ExecutionResult(
            status=ExecutionStatus.SUCCESS,
            logs="Execution completed successfully",
        )

        assert result.status == ExecutionStatus.SUCCESS
        assert result.logs == "Execution completed successfully"
        assert result.error_message is None
        assert result.output is None

    def test_execution_result_failed(self):
        """Test creating a failed result."""
        from app.services.executor_base import ExecutionResult, ExecutionStatus

        result = ExecutionResult(
            status=ExecutionStatus.FAILED,
            logs="Some logs",
            error_message="Something went wrong",
        )

        assert result.status == ExecutionStatus.FAILED
        assert result.error_message == "Something went wrong"

    def test_execution_result_with_output(self):
        """Test result with output data."""
        from app.services.executor_base import ExecutionResult, ExecutionStatus

        result = ExecutionResult(
            status=ExecutionStatus.SUCCESS,
            logs="logs",
            output='{"data": [1, 2, 3]}',
        )

        assert result.output == '{"data": [1, 2, 3]}'

    def test_execution_result_to_dict(self):
        """Test converting result to dictionary."""
        from app.services.executor_base import ExecutionResult, ExecutionStatus

        result = ExecutionResult(
            status=ExecutionStatus.SUCCESS,
            logs="Execution logs",
            error_message=None,
            output="some output",
        )

        d = result.to_dict()

        assert isinstance(d, dict)
        assert d["status"] == "success"
        assert d["logs"] == "Execution logs"
        assert d["error_message"] is None
        assert d["output"] == "some output"

    def test_execution_result_to_dict_failed(self):
        """Test converting failed result to dictionary."""
        from app.services.executor_base import ExecutionResult, ExecutionStatus

        result = ExecutionResult(
            status=ExecutionStatus.FAILED,
            logs="Error logs",
            error_message="Division by zero",
        )

        d = result.to_dict()

        assert d["status"] == "failed"
        assert d["error_message"] == "Division by zero"

    def test_execution_result_cancelled(self):
        """Test cancelled result."""
        from app.services.executor_base import ExecutionResult, ExecutionStatus

        result = ExecutionResult(
            status=ExecutionStatus.CANCELLED,
            logs="Cancelled by user",
            error_message="User cancelled",
        )

        assert result.status == ExecutionStatus.CANCELLED


class TestBaseExecutor:
    """Tests for BaseExecutor abstract class."""

    def test_base_executor_init_defaults(self):
        """Test BaseExecutor initialization with defaults."""
        from app.services.executor_base import BaseExecutor

        # Create a concrete implementation for testing
        class TestExecutor(BaseExecutor):
            @property
            def executor_type(self) -> str:
                return "test"

            async def execute(self, code, on_log=None):
                pass

            async def cancel(self):
                return True

            async def test_connection(self):
                return {"success": True}

        executor = TestExecutor()

        assert executor.master_url is None
        assert executor.config == {}
        assert executor._cancelled is False
        assert executor._process is None
        assert executor._session_id is None

    def test_base_executor_init_with_params(self):
        """Test BaseExecutor initialization with parameters."""
        from app.services.executor_base import BaseExecutor

        class TestExecutor(BaseExecutor):
            @property
            def executor_type(self) -> str:
                return "test"

            async def execute(self, code, on_log=None):
                pass

            async def cancel(self):
                return True

            async def test_connection(self):
                return {"success": True}

        config = {"spark.driver.memory": "4g"}
        executor = TestExecutor(master_url="local[*]", config=config)

        assert executor.master_url == "local[*]"
        assert executor.config == config

    def test_base_executor_is_cancelled(self):
        """Test is_cancelled method."""
        from app.services.executor_base import BaseExecutor

        class TestExecutor(BaseExecutor):
            @property
            def executor_type(self) -> str:
                return "test"

            async def execute(self, code, on_log=None):
                pass

            async def cancel(self):
                self._cancelled = True
                return True

            async def test_connection(self):
                return {"success": True}

        executor = TestExecutor()

        assert executor.is_cancelled() is False

        executor._cancelled = True
        assert executor.is_cancelled() is True

    def test_base_executor_abstract_methods(self):
        """Test that abstract methods must be implemented."""
        from app.services.executor_base import BaseExecutor

        # This should raise TypeError if we try to instantiate BaseExecutor directly
        with pytest.raises(TypeError):
            BaseExecutor()
