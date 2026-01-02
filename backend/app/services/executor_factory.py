"""
Factory for creating Spark executors based on connection type.
"""
from typing import Optional, Dict, Any

from .executor_base import BaseExecutor
from .local_executor import LocalExecutor
from .livy_executor import LivyExecutor


class ExecutorFactory:
    """
    Factory to create the appropriate executor based on connection type.

    Supported connection types:
    - local: Execute in local Spark mode (subprocess)
    - livy: Execute via Apache Livy REST API
    - standalone: Direct connection to Spark standalone cluster (via local executor)
    """

    EXECUTOR_MAP = {
        "local": LocalExecutor,
        "standalone": LocalExecutor,  # Uses spark-submit with master URL
        "livy": LivyExecutor,
    }

    @classmethod
    def create(
        cls,
        connection_type: str,
        master_url: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> BaseExecutor:
        """
        Create an executor for the given connection type.

        Args:
            connection_type: Type of connection (local, livy, standalone, etc.)
            master_url: Spark master URL or Livy URL
            config: Additional configuration

        Returns:
            An executor instance

        Raises:
            ValueError: If connection type is not supported
        """
        executor_class = cls.EXECUTOR_MAP.get(connection_type.lower())

        if not executor_class:
            raise ValueError(
                f"Unsupported connection type: {connection_type}. "
                f"Supported types: {list(cls.EXECUTOR_MAP.keys())}"
            )

        return executor_class(master_url=master_url, config=config)

    @classmethod
    def get_supported_types(cls) -> list:
        """Get list of supported connection types."""
        return list(cls.EXECUTOR_MAP.keys())

    @classmethod
    def is_supported(cls, connection_type: str) -> bool:
        """Check if a connection type is supported."""
        return connection_type.lower() in cls.EXECUTOR_MAP
