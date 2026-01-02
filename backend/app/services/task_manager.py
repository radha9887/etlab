"""
Background task manager for code execution.

Manages running executions, updating status in the database,
and handling cancellation requests.
"""
import asyncio
from typing import Dict, Optional
from datetime import datetime, timezone
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from .executor_factory import ExecutorFactory
from .executor_base import ExecutionStatus

logger = logging.getLogger(__name__)


class ExecutionTask:
    """Represents a running execution task."""

    def __init__(self, execution_id: str, executor):
        self.execution_id = execution_id
        self.executor = executor
        self.task: Optional[asyncio.Task] = None
        self.logs: list = []


class TaskManager:
    """
    Manages background execution tasks.

    Singleton pattern - use TaskManager.get_instance()
    """

    _instance: Optional["TaskManager"] = None

    def __init__(self):
        self.running_tasks: Dict[str, ExecutionTask] = {}

    @classmethod
    def get_instance(cls) -> "TaskManager":
        """Get singleton instance."""
        if cls._instance is None:
            cls._instance = TaskManager()
        return cls._instance

    async def start_execution(
        self,
        execution_id: str,
        code: str,
        connection_type: str,
        master_url: Optional[str],
        config: Optional[dict],
        db_session_factory
    ) -> bool:
        """
        Start a background execution task.

        Args:
            execution_id: The execution ID in the database
            code: PySpark code to execute
            connection_type: Type of Spark connection
            master_url: Spark master or Livy URL
            config: Additional configuration
            db_session_factory: Async session factory for DB updates

        Returns:
            True if task started successfully
        """
        if execution_id in self.running_tasks:
            logger.warning(f"Execution {execution_id} is already running")
            return False

        try:
            # Create executor
            executor = ExecutorFactory.create(
                connection_type=connection_type,
                master_url=master_url,
                config=config
            )

            # Create task wrapper
            exec_task = ExecutionTask(execution_id, executor)
            self.running_tasks[execution_id] = exec_task

            # Start background task
            exec_task.task = asyncio.create_task(
                self._run_execution(
                    exec_task,
                    code,
                    db_session_factory
                )
            )

            logger.info(f"Started execution task {execution_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to start execution {execution_id}: {e}")
            # Update status to failed
            await self._update_status(
                execution_id,
                ExecutionStatus.FAILED,
                db_session_factory,
                error_message=str(e)
            )
            return False

    async def cancel_execution(
        self,
        execution_id: str,
        db_session_factory
    ) -> bool:
        """
        Cancel a running execution.

        Args:
            execution_id: The execution to cancel
            db_session_factory: Async session factory for DB updates

        Returns:
            True if cancellation was successful
        """
        exec_task = self.running_tasks.get(execution_id)

        if not exec_task:
            logger.warning(f"Execution {execution_id} not found in running tasks")
            return False

        try:
            # Cancel the executor
            await exec_task.executor.cancel()

            # Cancel the asyncio task if still running
            if exec_task.task and not exec_task.task.done():
                exec_task.task.cancel()

            logger.info(f"Cancelled execution {execution_id}")
            return True

        except Exception as e:
            logger.error(f"Error cancelling execution {execution_id}: {e}")
            return False
        finally:
            # Remove from running tasks
            self.running_tasks.pop(execution_id, None)

    def get_running_executions(self) -> list:
        """Get list of currently running execution IDs."""
        return list(self.running_tasks.keys())

    def is_running(self, execution_id: str) -> bool:
        """Check if an execution is currently running."""
        return execution_id in self.running_tasks

    async def _run_execution(
        self,
        exec_task: ExecutionTask,
        code: str,
        db_session_factory
    ):
        """Run the execution and update database."""
        execution_id = exec_task.execution_id

        try:
            # Update status to running
            await self._update_status(
                execution_id,
                ExecutionStatus.RUNNING,
                db_session_factory,
                started_at=datetime.now(timezone.utc)
            )

            # Define log callback
            async def on_log(log_line: str):
                exec_task.logs.append(log_line)
                # Periodically update logs in DB (every 10 lines)
                if len(exec_task.logs) % 10 == 0:
                    await self._update_logs(
                        execution_id,
                        "\n".join(exec_task.logs),
                        db_session_factory
                    )

            # Execute
            result = await exec_task.executor.execute(
                code,
                on_log=lambda line: asyncio.create_task(on_log(line))
            )

            # Update final status
            await self._update_status(
                execution_id,
                result.status,
                db_session_factory,
                completed_at=datetime.now(timezone.utc),
                logs=result.logs,
                error_message=result.error_message
            )

            logger.info(f"Execution {execution_id} completed with status {result.status}")

        except asyncio.CancelledError:
            logger.info(f"Execution {execution_id} was cancelled")
            await self._update_status(
                execution_id,
                ExecutionStatus.CANCELLED,
                db_session_factory,
                completed_at=datetime.now(timezone.utc),
                logs="\n".join(exec_task.logs),
                error_message="Cancelled by user"
            )

        except Exception as e:
            logger.error(f"Execution {execution_id} failed with error: {e}")
            await self._update_status(
                execution_id,
                ExecutionStatus.FAILED,
                db_session_factory,
                completed_at=datetime.now(timezone.utc),
                logs="\n".join(exec_task.logs),
                error_message=str(e)
            )

        finally:
            # Remove from running tasks
            self.running_tasks.pop(execution_id, None)

    async def _update_status(
        self,
        execution_id: str,
        status: ExecutionStatus,
        db_session_factory,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        logs: Optional[str] = None,
        error_message: Optional[str] = None
    ):
        """Update execution status in database."""
        from ..models import ExecutionHistory

        try:
            async with db_session_factory() as session:
                from sqlalchemy import select

                result = await session.execute(
                    select(ExecutionHistory).where(ExecutionHistory.id == execution_id)
                )
                execution = result.scalar_one_or_none()

                if execution:
                    execution.status = status.value
                    if started_at:
                        execution.started_at = started_at
                    if completed_at:
                        execution.completed_at = completed_at
                    if logs is not None:
                        execution.logs = logs
                    if error_message is not None:
                        execution.error_message = error_message

                    await session.commit()
                    logger.debug(f"Updated execution {execution_id} status to {status}")
        except Exception as e:
            logger.error(f"Failed to update execution {execution_id}: {e}")

    async def _update_logs(
        self,
        execution_id: str,
        logs: str,
        db_session_factory
    ):
        """Update execution logs in database."""
        from ..models import ExecutionHistory

        try:
            async with db_session_factory() as session:
                from sqlalchemy import select

                result = await session.execute(
                    select(ExecutionHistory).where(ExecutionHistory.id == execution_id)
                )
                execution = result.scalar_one_or_none()

                if execution:
                    execution.logs = logs
                    await session.commit()
        except Exception as e:
            logger.error(f"Failed to update logs for {execution_id}: {e}")


# Singleton instance
task_manager = TaskManager.get_instance()
