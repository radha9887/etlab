"""
Execution router - handles code execution requests.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from ..database import get_db, async_session_maker
from ..models import ExecutionHistory, SparkConnection
from ..schemas import (
    ExecutionCreate,
    ExecutionResponse,
    ExecutionListResponse,
)
from ..services import task_manager, ExecutorFactory

router = APIRouter(prefix="/api", tags=["execution"])


@router.post("/execute", response_model=ExecutionResponse, status_code=status.HTTP_201_CREATED)
async def execute_code(data: ExecutionCreate, db: AsyncSession = Depends(get_db)):
    """
    Execute PySpark code.

    This endpoint:
    1. Creates an ExecutionHistory record with status "pending"
    2. Starts a background task to run the code
    3. Returns immediately with the execution ID

    Poll GET /api/executions/{id} or /api/executions/{id}/logs for status updates.
    """
    # Get Spark connection (use default if not specified)
    connection = None
    if data.spark_connection_id:
        result = await db.execute(
            select(SparkConnection).where(SparkConnection.id == data.spark_connection_id)
        )
        connection = result.scalar_one_or_none()
        if not connection:
            raise HTTPException(status_code=404, detail="Spark connection not found")
    else:
        # Try to get default connection
        result = await db.execute(
            select(SparkConnection).where(SparkConnection.is_default == True)
        )
        connection = result.scalar_one_or_none()

    # Determine connection type and URL
    if connection:
        connection_type = connection.connection_type
        master_url = connection.master_url
        config = connection.config or {}
    else:
        # No connection configured - use local mode
        connection_type = "local"
        master_url = "local[*]"
        config = {}

    # Validate connection type is supported
    if not ExecutorFactory.is_supported(connection_type):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported connection type: {connection_type}. "
                   f"Supported: {ExecutorFactory.get_supported_types()}"
        )

    now = datetime.now(timezone.utc)
    exec_id = str(uuid.uuid4())

    # Create execution record
    execution = ExecutionHistory(
        id=exec_id,
        page_id=data.page_id,
        spark_connection_id=connection.id if connection else None,
        code=data.code,
        status="pending",
        created_at=now,
    )
    db.add(execution)
    await db.flush()
    await db.commit()

    # Start background execution
    await task_manager.start_execution(
        execution_id=exec_id,
        code=data.code,
        connection_type=connection_type,
        master_url=master_url,
        config=config,
        db_session_factory=async_session_maker
    )

    return ExecutionResponse(
        id=exec_id,
        page_id=data.page_id,
        spark_connection_id=connection.id if connection else None,
        code=data.code,
        status="pending",
        started_at=None,
        completed_at=None,
        logs=None,
        error_message=None,
        created_at=now,
    )


@router.get("/executions", response_model=List[ExecutionListResponse])
async def list_executions(
    page_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """List execution history."""
    query = select(ExecutionHistory).order_by(ExecutionHistory.created_at.desc())

    if page_id:
        query = query.where(ExecutionHistory.page_id == page_id)
    if status:
        query = query.where(ExecutionHistory.status == status)

    query = query.limit(limit)

    result = await db.execute(query)
    executions = result.scalars().all()

    return [
        ExecutionListResponse(
            id=e.id,
            page_id=e.page_id,
            status=e.status,
            started_at=e.started_at,
            completed_at=e.completed_at,
            created_at=e.created_at,
        )
        for e in executions
    ]


@router.get("/executions/{execution_id}", response_model=ExecutionResponse)
async def get_execution(execution_id: str, db: AsyncSession = Depends(get_db)):
    """Get execution details."""
    result = await db.execute(
        select(ExecutionHistory).where(ExecutionHistory.id == execution_id)
    )
    execution = result.scalar_one_or_none()

    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    return ExecutionResponse(
        id=execution.id,
        page_id=execution.page_id,
        spark_connection_id=execution.spark_connection_id,
        code=execution.code,
        status=execution.status,
        started_at=execution.started_at,
        completed_at=execution.completed_at,
        logs=execution.logs,
        error_message=execution.error_message,
        created_at=execution.created_at,
    )


@router.get("/executions/{execution_id}/logs")
async def get_execution_logs(execution_id: str, db: AsyncSession = Depends(get_db)):
    """Get execution logs."""
    result = await db.execute(
        select(ExecutionHistory).where(ExecutionHistory.id == execution_id)
    )
    execution = result.scalar_one_or_none()

    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    # Check if execution is still running
    is_running = task_manager.is_running(execution_id)

    return {
        "id": execution.id,
        "status": execution.status,
        "logs": execution.logs or "",
        "is_running": is_running,
        "error_message": execution.error_message,
    }


@router.post("/executions/{execution_id}/cancel", response_model=ExecutionResponse)
async def cancel_execution(execution_id: str, db: AsyncSession = Depends(get_db)):
    """Cancel a running execution."""
    result = await db.execute(
        select(ExecutionHistory).where(ExecutionHistory.id == execution_id)
    )
    execution = result.scalar_one_or_none()

    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    if execution.status not in ["pending", "running"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel execution with status: {execution.status}"
        )

    # Cancel via task manager
    cancelled = await task_manager.cancel_execution(
        execution_id,
        async_session_maker
    )

    if not cancelled:
        # Task wasn't running in task manager, update status directly
        now = datetime.now(timezone.utc)
        execution.status = "cancelled"
        execution.completed_at = now
        await db.flush()
    else:
        # Re-query to get updated status from task manager
        result = await db.execute(
            select(ExecutionHistory).where(ExecutionHistory.id == execution_id)
        )
        execution = result.scalar_one_or_none()

    return ExecutionResponse(
        id=execution.id,
        page_id=execution.page_id,
        spark_connection_id=execution.spark_connection_id,
        code=execution.code,
        status=execution.status,
        started_at=execution.started_at,
        completed_at=execution.completed_at,
        logs=execution.logs,
        error_message=execution.error_message,
        created_at=execution.created_at,
    )


@router.get("/executions/running/list")
async def list_running_executions():
    """Get list of currently running execution IDs."""
    return {
        "running": task_manager.get_running_executions()
    }
