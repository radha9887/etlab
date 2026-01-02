from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from ..database import get_db
from ..models import SparkConnection
from ..schemas import (
    SparkConnectionCreate,
    SparkConnectionUpdate,
    SparkConnectionResponse,
    SparkConnectionListResponse,
    SparkConnectionTest,
)

router = APIRouter(prefix="/api/spark-connections", tags=["spark"])


@router.get("", response_model=List[SparkConnectionListResponse])
async def list_spark_connections(db: AsyncSession = Depends(get_db)):
    """List all Spark connections."""
    result = await db.execute(
        select(SparkConnection).order_by(SparkConnection.is_default.desc(), SparkConnection.name)
    )
    connections = result.scalars().all()

    return [
        SparkConnectionListResponse(
            id=c.id,
            name=c.name,
            connection_type=c.connection_type,
            master_url=c.master_url,
            is_default=c.is_default,
            created_at=c.created_at,
        )
        for c in connections
    ]


@router.post("", response_model=SparkConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_spark_connection(
    data: SparkConnectionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new Spark connection."""
    # If this is set as default, unset other defaults
    if data.is_default:
        result = await db.execute(
            select(SparkConnection).where(SparkConnection.is_default == True)
        )
        for conn in result.scalars().all():
            conn.is_default = False

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    conn_id = str(uuid.uuid4())
    connection = SparkConnection(
        id=conn_id,
        name=data.name,
        connection_type=data.connection_type,
        master_url=data.master_url,
        config=data.config,
        is_default=data.is_default,
        created_at=now,
        updated_at=now,
    )
    db.add(connection)
    await db.flush()

    return SparkConnectionResponse(
        id=conn_id,
        name=data.name,
        connection_type=data.connection_type,
        master_url=data.master_url,
        config=data.config or {},
        is_default=data.is_default,
        created_at=now,
        updated_at=now,
    )


@router.get("/{connection_id}", response_model=SparkConnectionResponse)
async def get_spark_connection(connection_id: str, db: AsyncSession = Depends(get_db)):
    """Get a Spark connection by ID."""
    result = await db.execute(
        select(SparkConnection).where(SparkConnection.id == connection_id)
    )
    connection = result.scalar_one_or_none()

    if not connection:
        raise HTTPException(status_code=404, detail="Spark connection not found")

    return SparkConnectionResponse(
        id=connection.id,
        name=connection.name,
        connection_type=connection.connection_type,
        master_url=connection.master_url,
        config=connection.config or {},
        is_default=connection.is_default,
        created_at=connection.created_at,
        updated_at=connection.updated_at,
    )


@router.put("/{connection_id}", response_model=SparkConnectionResponse)
async def update_spark_connection(
    connection_id: str,
    data: SparkConnectionUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a Spark connection."""
    result = await db.execute(
        select(SparkConnection).where(SparkConnection.id == connection_id)
    )
    connection = result.scalar_one_or_none()

    if not connection:
        raise HTTPException(status_code=404, detail="Spark connection not found")

    # If setting as default, unset other defaults
    if data.is_default:
        result = await db.execute(
            select(SparkConnection).where(
                SparkConnection.is_default == True,
                SparkConnection.id != connection_id
            )
        )
        for conn in result.scalars().all():
            conn.is_default = False

    from datetime import datetime, timezone

    if data.name is not None:
        connection.name = data.name
    if data.connection_type is not None:
        connection.connection_type = data.connection_type
    if data.master_url is not None:
        connection.master_url = data.master_url
    if data.config is not None:
        connection.config = data.config
    if data.is_default is not None:
        connection.is_default = data.is_default
    connection.updated_at = datetime.now(timezone.utc)

    await db.flush()

    return SparkConnectionResponse(
        id=connection.id,
        name=connection.name,
        connection_type=connection.connection_type,
        master_url=connection.master_url,
        config=connection.config or {},
        is_default=connection.is_default,
        created_at=connection.created_at,
        updated_at=connection.updated_at,
    )


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_spark_connection(connection_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a Spark connection."""
    result = await db.execute(
        select(SparkConnection).where(SparkConnection.id == connection_id)
    )
    connection = result.scalar_one_or_none()

    if not connection:
        raise HTTPException(status_code=404, detail="Spark connection not found")

    await db.delete(connection)


@router.post("/{connection_id}/test", response_model=SparkConnectionTest)
async def test_spark_connection(connection_id: str, db: AsyncSession = Depends(get_db)):
    """Test a Spark connection."""
    from ..services import ExecutorFactory

    result = await db.execute(
        select(SparkConnection).where(SparkConnection.id == connection_id)
    )
    connection = result.scalar_one_or_none()

    if not connection:
        raise HTTPException(status_code=404, detail="Spark connection not found")

    # Check if connection type is supported
    if not ExecutorFactory.is_supported(connection.connection_type):
        return SparkConnectionTest(
            success=False,
            message=f"Connection type '{connection.connection_type}' is not supported",
            details={"supported_types": ExecutorFactory.get_supported_types()},
        )

    # Create executor and test connection
    try:
        executor = ExecutorFactory.create(
            connection_type=connection.connection_type,
            master_url=connection.master_url,
            config=connection.config
        )
        result = await executor.test_connection()
        return SparkConnectionTest(
            success=result.get("success", False),
            message=result.get("message", "Unknown"),
            details=result.get("details"),
        )
    except Exception as e:
        return SparkConnectionTest(
            success=False,
            message=f"Error testing connection: {str(e)}",
            details=None,
        )


@router.put("/{connection_id}/default", response_model=SparkConnectionResponse)
async def set_default_connection(connection_id: str, db: AsyncSession = Depends(get_db)):
    """Set a Spark connection as default."""
    result = await db.execute(
        select(SparkConnection).where(SparkConnection.id == connection_id)
    )
    connection = result.scalar_one_or_none()

    if not connection:
        raise HTTPException(status_code=404, detail="Spark connection not found")

    from datetime import datetime, timezone

    # Unset other defaults
    result = await db.execute(
        select(SparkConnection).where(SparkConnection.is_default == True)
    )
    for conn in result.scalars().all():
        conn.is_default = False

    connection.is_default = True
    connection.updated_at = datetime.now(timezone.utc)
    await db.flush()

    return SparkConnectionResponse(
        id=connection.id,
        name=connection.name,
        connection_type=connection.connection_type,
        master_url=connection.master_url,
        config=connection.config or {},
        is_default=connection.is_default,
        created_at=connection.created_at,
        updated_at=connection.updated_at,
    )
