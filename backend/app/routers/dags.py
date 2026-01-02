"""
DAG Definition API Router
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..database import get_db
from ..models import DagDefinition, DagExecution, Workspace
from ..schemas.dag_definition import (
    DagDefinitionCreate,
    DagDefinitionUpdate,
    DagDefinitionResponse,
    DagDefinitionList,
    DagExecutionResponse,
    DagExecutionList,
    DagSyncRequest,
    DagSyncResponse,
)

router = APIRouter(prefix="/dags", tags=["DAG Definitions"])


# ============================================
# DAG Definition CRUD
# ============================================

@router.get("/workspace/{workspace_id}", response_model=DagDefinitionList)
async def list_dags(
    workspace_id: str,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    """List all DAG definitions in a workspace."""
    # Verify workspace exists
    workspace = await db.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Build query
    query = select(DagDefinition).where(DagDefinition.workspace_id == workspace_id)
    if is_active is not None:
        query = query.where(DagDefinition.is_active == is_active)
    query = query.order_by(DagDefinition.updated_at.desc())

    result = await db.execute(query)
    dags = result.scalars().all()

    # Get total count
    count_query = select(func.count()).select_from(DagDefinition).where(
        DagDefinition.workspace_id == workspace_id
    )
    if is_active is not None:
        count_query = count_query.where(DagDefinition.is_active == is_active)
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    return DagDefinitionList(dags=dags, total=total)


@router.post("/workspace/{workspace_id}", response_model=DagDefinitionResponse, status_code=201)
async def create_dag(
    workspace_id: str,
    dag_data: DagDefinitionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new DAG definition."""
    # Verify workspace exists
    workspace = await db.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Check for duplicate dag_id in workspace
    existing = await db.execute(
        select(DagDefinition).where(
            DagDefinition.workspace_id == workspace_id,
            DagDefinition.dag_id == dag_data.dag_id
        )
    )
    if existing.scalar():
        raise HTTPException(status_code=400, detail=f"DAG ID '{dag_data.dag_id}' already exists in this workspace")

    # Create DAG definition
    dag = DagDefinition(
        workspace_id=workspace_id,
        page_id=dag_data.page_id,
        dag_id=dag_data.dag_id,
        name=dag_data.name,
        description=dag_data.description,
        dag_config=dag_data.dag_config,
        tasks=dag_data.tasks,
        edges=dag_data.edges,
        generated_code=dag_data.generated_code,
    )

    db.add(dag)
    await db.commit()
    await db.refresh(dag)

    return dag


@router.get("/{dag_id}", response_model=DagDefinitionResponse)
async def get_dag(
    dag_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a DAG definition by ID."""
    dag = await db.get(DagDefinition, dag_id)
    if not dag:
        raise HTTPException(status_code=404, detail="DAG definition not found")
    return dag


@router.get("/by-page/{page_id}", response_model=DagDefinitionResponse)
async def get_dag_by_page(
    page_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a DAG definition by page ID."""
    result = await db.execute(
        select(DagDefinition).where(DagDefinition.page_id == page_id)
    )
    dag = result.scalar()
    if not dag:
        raise HTTPException(status_code=404, detail="DAG definition not found for this page")
    return dag


@router.put("/{dag_id}", response_model=DagDefinitionResponse)
async def update_dag(
    dag_id: str,
    dag_data: DagDefinitionUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a DAG definition."""
    dag = await db.get(DagDefinition, dag_id)
    if not dag:
        raise HTTPException(status_code=404, detail="DAG definition not found")

    # Update fields
    update_data = dag_data.model_dump(exclude_unset=True)

    # If dag_id is being changed, check for duplicates
    if "dag_id" in update_data and update_data["dag_id"] != dag.dag_id:
        existing = await db.execute(
            select(DagDefinition).where(
                DagDefinition.workspace_id == dag.workspace_id,
                DagDefinition.dag_id == update_data["dag_id"],
                DagDefinition.id != dag_id
            )
        )
        if existing.scalar():
            raise HTTPException(
                status_code=400,
                detail=f"DAG ID '{update_data['dag_id']}' already exists in this workspace"
            )

    for field, value in update_data.items():
        setattr(dag, field, value)

    # Increment version and mark as not synced
    dag.version += 1
    dag.is_synced = False

    await db.commit()
    await db.refresh(dag)

    return dag


@router.delete("/{dag_id}", status_code=204)
async def delete_dag(
    dag_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a DAG definition."""
    dag = await db.get(DagDefinition, dag_id)
    if not dag:
        raise HTTPException(status_code=404, detail="DAG definition not found")

    await db.delete(dag)
    await db.commit()


# ============================================
# DAG Sync
# ============================================

@router.post("/{dag_id}/sync", response_model=DagSyncResponse)
async def sync_dag(
    dag_id: str,
    sync_request: DagSyncRequest = None,
    db: AsyncSession = Depends(get_db),
):
    """Sync DAG definition to Airflow."""
    dag = await db.get(DagDefinition, dag_id)
    if not dag:
        raise HTTPException(status_code=404, detail="DAG definition not found")

    # Import airflow sync functionality
    try:
        from .airflow import sync_dag_to_airflow
        result = await sync_dag_to_airflow(dag.dag_id, dag.generated_code)

        if result.get("success"):
            dag.is_synced = True
            dag.last_synced_at = datetime.utcnow()
            dag.sync_error = None
            await db.commit()

            return DagSyncResponse(
                success=True,
                message="DAG synced successfully",
                file_path=result.get("file_path"),
                synced_at=dag.last_synced_at,
            )
        else:
            dag.sync_error = result.get("message", "Unknown sync error")
            await db.commit()

            return DagSyncResponse(
                success=False,
                message=dag.sync_error,
            )

    except Exception as e:
        dag.sync_error = str(e)
        await db.commit()

        return DagSyncResponse(
            success=False,
            message=f"Sync failed: {str(e)}",
        )


# ============================================
# DAG Executions
# ============================================

@router.get("/{dag_id}/executions", response_model=DagExecutionList)
async def list_executions(
    dag_id: str,
    status: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List executions for a DAG."""
    # Verify DAG exists
    dag = await db.get(DagDefinition, dag_id)
    if not dag:
        raise HTTPException(status_code=404, detail="DAG definition not found")

    # Build query
    query = select(DagExecution).where(DagExecution.dag_definition_id == dag_id)
    if status:
        query = query.where(DagExecution.status == status)
    query = query.order_by(DagExecution.created_at.desc()).limit(limit)

    result = await db.execute(query)
    executions = result.scalars().all()

    # Get total count
    count_query = select(func.count()).select_from(DagExecution).where(
        DagExecution.dag_definition_id == dag_id
    )
    if status:
        count_query = count_query.where(DagExecution.status == status)
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    return DagExecutionList(executions=executions, total=total)


@router.post("/{dag_id}/trigger", response_model=DagExecutionResponse, status_code=201)
async def trigger_dag(
    dag_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Trigger a DAG execution."""
    dag = await db.get(DagDefinition, dag_id)
    if not dag:
        raise HTTPException(status_code=404, detail="DAG definition not found")

    # Create execution record
    execution = DagExecution(
        dag_definition_id=dag_id,
        status="pending",
        triggered_by="manual",
    )
    db.add(execution)
    await db.commit()
    await db.refresh(execution)

    # TODO: Actually trigger in Airflow
    # For now, just return the pending execution

    return execution


@router.get("/executions/{execution_id}", response_model=DagExecutionResponse)
async def get_execution(
    execution_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get execution details."""
    execution = await db.get(DagExecution, execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution
