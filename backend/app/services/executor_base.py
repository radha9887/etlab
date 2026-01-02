"""
Base class for Spark code executors.
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, Callable
from dataclasses import dataclass
from enum import Enum
import asyncio


class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class ExecutionResult:
    """Result of code execution."""
    status: ExecutionStatus
    logs: str = ""
    error_message: Optional[str] = None
    output: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status.value,
            "logs": self.logs,
            "error_message": self.error_message,
            "output": self.output,
        }


class BaseExecutor(ABC):
    """
    Abstract base class for all Spark code executors.

    Subclasses must implement:
    - execute(): Run the code and return result
    - cancel(): Cancel running execution
    - test_connection(): Test if connection is valid
    """

    def __init__(
        self,
        master_url: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None
    ):
        self.master_url = master_url
        self.config = config or {}
        self._cancelled = False
        self._process = None  # For local executor
        self._session_id = None  # For Livy executor

    @property
    @abstractmethod
    def executor_type(self) -> str:
        """Return the type of executor (local, livy, etc.)"""
        pass

    @abstractmethod
    async def execute(
        self,
        code: str,
        on_log: Optional[Callable[[str], None]] = None
    ) -> ExecutionResult:
        """
        Execute PySpark code.

        Args:
            code: The PySpark code to execute
            on_log: Optional callback for streaming logs

        Returns:
            ExecutionResult with status, logs, and any errors
        """
        pass

    @abstractmethod
    async def cancel(self) -> bool:
        """
        Cancel the current execution.

        Returns:
            True if cancellation was successful
        """
        pass

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """
        Test if the connection is valid.

        Returns:
            Dict with 'success' boolean and 'message' string
        """
        pass

    def is_cancelled(self) -> bool:
        """Check if execution was cancelled."""
        return self._cancelled
