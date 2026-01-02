"""
Unit tests for app/services/executor_factory.py
"""
import pytest


class TestExecutorFactory:
    """Tests for ExecutorFactory."""

    def test_create_local_executor(self):
        """Test creating a local executor."""
        from app.services.executor_factory import ExecutorFactory
        from app.services.local_executor import LocalExecutor

        executor = ExecutorFactory.create("local")

        assert isinstance(executor, LocalExecutor)
        assert executor.executor_type == "local"

    def test_create_local_executor_with_master(self):
        """Test creating local executor with master URL."""
        from app.services.executor_factory import ExecutorFactory

        executor = ExecutorFactory.create(
            "local",
            master_url="local[4]",
        )

        assert executor.master_url == "local[4]"

    def test_create_local_executor_with_config(self):
        """Test creating local executor with config."""
        from app.services.executor_factory import ExecutorFactory

        config = {
            "spark.driver.memory": "4g",
            "spark.executor.memory": "4g",
        }
        executor = ExecutorFactory.create("local", config=config)

        assert executor.config == config

    def test_create_standalone_executor(self):
        """Test creating standalone executor (uses LocalExecutor)."""
        from app.services.executor_factory import ExecutorFactory
        from app.services.local_executor import LocalExecutor

        executor = ExecutorFactory.create(
            "standalone",
            master_url="spark://master:7077",
        )

        assert isinstance(executor, LocalExecutor)
        assert executor.master_url == "spark://master:7077"

    def test_create_livy_executor(self):
        """Test creating a Livy executor."""
        from app.services.executor_factory import ExecutorFactory
        from app.services.livy_executor import LivyExecutor

        executor = ExecutorFactory.create(
            "livy",
            master_url="http://livy-server:8998",
        )

        assert isinstance(executor, LivyExecutor)

    def test_create_executor_case_insensitive(self):
        """Test that connection type is case insensitive."""
        from app.services.executor_factory import ExecutorFactory
        from app.services.local_executor import LocalExecutor

        executor1 = ExecutorFactory.create("LOCAL")
        executor2 = ExecutorFactory.create("Local")
        executor3 = ExecutorFactory.create("local")

        assert isinstance(executor1, LocalExecutor)
        assert isinstance(executor2, LocalExecutor)
        assert isinstance(executor3, LocalExecutor)

    def test_create_unknown_type_raises(self):
        """Test that unknown connection type raises ValueError."""
        from app.services.executor_factory import ExecutorFactory

        with pytest.raises(ValueError) as exc_info:
            ExecutorFactory.create("unknown_type")

        assert "Unsupported connection type" in str(exc_info.value)
        assert "unknown_type" in str(exc_info.value)

    def test_get_supported_types(self):
        """Test getting list of supported types."""
        from app.services.executor_factory import ExecutorFactory

        types = ExecutorFactory.get_supported_types()

        assert isinstance(types, list)
        assert "local" in types
        assert "livy" in types
        assert "standalone" in types
        assert len(types) >= 3

    def test_is_supported_true(self):
        """Test is_supported returns True for supported types."""
        from app.services.executor_factory import ExecutorFactory

        assert ExecutorFactory.is_supported("local") is True
        assert ExecutorFactory.is_supported("livy") is True
        assert ExecutorFactory.is_supported("standalone") is True

    def test_is_supported_false(self):
        """Test is_supported returns False for unsupported types."""
        from app.services.executor_factory import ExecutorFactory

        assert ExecutorFactory.is_supported("kubernetes") is False
        assert ExecutorFactory.is_supported("databricks") is False
        assert ExecutorFactory.is_supported("unknown") is False

    def test_is_supported_case_insensitive(self):
        """Test is_supported is case insensitive."""
        from app.services.executor_factory import ExecutorFactory

        assert ExecutorFactory.is_supported("LOCAL") is True
        assert ExecutorFactory.is_supported("Livy") is True
