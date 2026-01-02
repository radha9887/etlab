from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from ..database import get_db
from ..models import SchemaDefinition, Workspace
from ..schemas import (
    SchemaDefinitionCreate,
    SchemaDefinitionUpdate,
    SchemaDefinitionResponse,
    SchemaDefinitionListResponse,
)

router = APIRouter(prefix="/api", tags=["schemas"])


@router.get("/workspaces/{workspace_id}/schemas", response_model=SchemaDefinitionListResponse)
async def list_schemas(
    workspace_id: str,
    source_type: Optional[str] = Query(None, description="Filter by source type"),
    is_favorite: Optional[bool] = Query(None, description="Filter by favorite status"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    db: AsyncSession = Depends(get_db)
):
    """List all schema definitions in a workspace with optional filters."""
    # Verify workspace exists
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Build query with filters
    query = select(SchemaDefinition).where(SchemaDefinition.workspace_id == workspace_id)

    if source_type:
        query = query.where(SchemaDefinition.source_type == source_type)
    if is_favorite is not None:
        query = query.where(SchemaDefinition.is_favorite == is_favorite)

    query = query.order_by(SchemaDefinition.updated_at.desc())

    result = await db.execute(query)
    schemas = result.scalars().all()

    # Filter by tag if specified (tags is a JSON array)
    if tag:
        schemas = [s for s in schemas if tag in (s.tags or [])]

    return SchemaDefinitionListResponse(
        schemas=[
            SchemaDefinitionResponse(
                id=s.id,
                workspace_id=s.workspace_id,
                name=s.name,
                description=s.description,
                source_type=s.source_type,
                columns=s.columns or [],
                config=s.config or {},
                is_favorite=s.is_favorite,
                tags=s.tags or [],
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
            for s in schemas
        ],
        total=len(schemas)
    )


@router.post("/workspaces/{workspace_id}/schemas", response_model=SchemaDefinitionResponse, status_code=status.HTTP_201_CREATED)
async def create_schema(
    workspace_id: str,
    data: SchemaDefinitionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new schema definition in a workspace."""
    now = datetime.now(timezone.utc)

    # Verify workspace exists
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Workspace not found")

    schema_id = str(uuid.uuid4())
    schema = SchemaDefinition(
        id=schema_id,
        workspace_id=workspace_id,
        name=data.name,
        description=data.description,
        source_type=data.source_type,
        columns=[col.model_dump() for col in data.columns],
        config=data.config,
        is_favorite=data.is_favorite,
        tags=data.tags,
        created_at=now,
        updated_at=now,
    )
    db.add(schema)
    await db.flush()

    return SchemaDefinitionResponse(
        id=schema_id,
        workspace_id=workspace_id,
        name=data.name,
        description=data.description,
        source_type=data.source_type,
        columns=data.columns,
        config=data.config or {},
        is_favorite=data.is_favorite,
        tags=data.tags or [],
        created_at=now,
        updated_at=now,
    )


@router.get("/schemas/{schema_id}", response_model=SchemaDefinitionResponse)
async def get_schema(schema_id: str, db: AsyncSession = Depends(get_db)):
    """Get a schema definition by ID."""
    result = await db.execute(select(SchemaDefinition).where(SchemaDefinition.id == schema_id))
    schema = result.scalar_one_or_none()

    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")

    return SchemaDefinitionResponse(
        id=schema.id,
        workspace_id=schema.workspace_id,
        name=schema.name,
        description=schema.description,
        source_type=schema.source_type,
        columns=schema.columns or [],
        config=schema.config or {},
        is_favorite=schema.is_favorite,
        tags=schema.tags or [],
        created_at=schema.created_at,
        updated_at=schema.updated_at,
    )


@router.put("/schemas/{schema_id}", response_model=SchemaDefinitionResponse)
async def update_schema(
    schema_id: str,
    data: SchemaDefinitionUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a schema definition."""
    result = await db.execute(select(SchemaDefinition).where(SchemaDefinition.id == schema_id))
    schema = result.scalar_one_or_none()

    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")

    if data.name is not None:
        schema.name = data.name
    if data.description is not None:
        schema.description = data.description
    if data.source_type is not None:
        schema.source_type = data.source_type
    if data.columns is not None:
        schema.columns = [col.model_dump() for col in data.columns]
    if data.config is not None:
        schema.config = data.config
    if data.is_favorite is not None:
        schema.is_favorite = data.is_favorite
    if data.tags is not None:
        schema.tags = data.tags

    schema.updated_at = datetime.now(timezone.utc)
    await db.flush()

    return SchemaDefinitionResponse(
        id=schema.id,
        workspace_id=schema.workspace_id,
        name=schema.name,
        description=schema.description,
        source_type=schema.source_type,
        columns=schema.columns or [],
        config=schema.config or {},
        is_favorite=schema.is_favorite,
        tags=schema.tags or [],
        created_at=schema.created_at,
        updated_at=schema.updated_at,
    )


@router.delete("/schemas/{schema_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schema(schema_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a schema definition."""
    result = await db.execute(select(SchemaDefinition).where(SchemaDefinition.id == schema_id))
    schema = result.scalar_one_or_none()

    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")

    await db.delete(schema)


@router.post("/schemas/{schema_id}/duplicate", response_model=SchemaDefinitionResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_schema(schema_id: str, db: AsyncSession = Depends(get_db)):
    """Duplicate a schema definition."""
    now = datetime.now(timezone.utc)

    result = await db.execute(select(SchemaDefinition).where(SchemaDefinition.id == schema_id))
    original = result.scalar_one_or_none()

    if not original:
        raise HTTPException(status_code=404, detail="Schema not found")

    dup_id = str(uuid.uuid4())
    dup_name = f"{original.name} (Copy)"

    duplicate = SchemaDefinition(
        id=dup_id,
        workspace_id=original.workspace_id,
        name=dup_name,
        description=original.description,
        source_type=original.source_type,
        columns=original.columns,
        config=original.config,
        is_favorite=False,
        tags=original.tags,
        created_at=now,
        updated_at=now,
    )
    db.add(duplicate)
    await db.flush()

    return SchemaDefinitionResponse(
        id=dup_id,
        workspace_id=original.workspace_id,
        name=dup_name,
        description=original.description,
        source_type=original.source_type,
        columns=original.columns or [],
        config=original.config or {},
        is_favorite=False,
        tags=original.tags or [],
        created_at=now,
        updated_at=now,
    )


@router.patch("/schemas/{schema_id}/favorite", response_model=SchemaDefinitionResponse)
async def toggle_favorite(schema_id: str, db: AsyncSession = Depends(get_db)):
    """Toggle the favorite status of a schema."""
    result = await db.execute(select(SchemaDefinition).where(SchemaDefinition.id == schema_id))
    schema = result.scalar_one_or_none()

    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")

    schema.is_favorite = not schema.is_favorite
    schema.updated_at = datetime.now(timezone.utc)
    await db.flush()

    return SchemaDefinitionResponse(
        id=schema.id,
        workspace_id=schema.workspace_id,
        name=schema.name,
        description=schema.description,
        source_type=schema.source_type,
        columns=schema.columns or [],
        config=schema.config or {},
        is_favorite=schema.is_favorite,
        tags=schema.tags or [],
        created_at=schema.created_at,
        updated_at=schema.updated_at,
    )


# Default/seed schemas to load
DEFAULT_SCHEMAS = [
    {
        "name": "customers",
        "description": "Customer master data",
        "source_type": "parquet",
        "columns": [
            {"name": "customer_id", "dataType": "long", "nullable": False, "description": "Unique customer identifier"},
            {"name": "first_name", "dataType": "string", "nullable": True, "description": "Customer first name"},
            {"name": "last_name", "dataType": "string", "nullable": True, "description": "Customer last name"},
            {"name": "email", "dataType": "string", "nullable": True, "description": "Email address"},
            {"name": "phone", "dataType": "string", "nullable": True, "description": "Phone number"},
            {"name": "created_at", "dataType": "timestamp", "nullable": True, "description": "Account creation date"},
            {"name": "is_active", "dataType": "boolean", "nullable": False, "description": "Active status"},
        ],
        "config": {"path": "s3://data-lake/customers/"},
        "tags": ["master", "customer"],
    },
    {
        "name": "orders",
        "description": "Sales order data",
        "source_type": "parquet",
        "columns": [
            {"name": "order_id", "dataType": "long", "nullable": False, "description": "Unique order identifier"},
            {"name": "customer_id", "dataType": "long", "nullable": False, "description": "Customer reference"},
            {"name": "order_date", "dataType": "date", "nullable": False, "description": "Date of order"},
            {"name": "total_amount", "dataType": "decimal(10,2)", "nullable": True, "description": "Order total"},
            {"name": "status", "dataType": "string", "nullable": True, "description": "Order status"},
            {"name": "shipping_address", "dataType": "string", "nullable": True, "description": "Delivery address"},
        ],
        "config": {"path": "s3://data-lake/orders/"},
        "tags": ["transactional", "sales"],
    },
    {
        "name": "products",
        "description": "Product catalog",
        "source_type": "csv",
        "columns": [
            {"name": "product_id", "dataType": "long", "nullable": False, "description": "Unique product identifier"},
            {"name": "name", "dataType": "string", "nullable": False, "description": "Product name"},
            {"name": "category", "dataType": "string", "nullable": True, "description": "Product category"},
            {"name": "price", "dataType": "decimal(10,2)", "nullable": True, "description": "Unit price"},
            {"name": "stock_quantity", "dataType": "integer", "nullable": True, "description": "Current stock level"},
            {"name": "supplier_id", "dataType": "long", "nullable": True, "description": "Supplier reference"},
        ],
        "config": {"path": "/data/products.csv", "header": True, "inferSchema": True},
        "tags": ["master", "inventory"],
    },
    {
        "name": "order_items",
        "description": "Order line items",
        "source_type": "parquet",
        "columns": [
            {"name": "item_id", "dataType": "long", "nullable": False, "description": "Unique item identifier"},
            {"name": "order_id", "dataType": "long", "nullable": False, "description": "Order reference"},
            {"name": "product_id", "dataType": "long", "nullable": False, "description": "Product reference"},
            {"name": "quantity", "dataType": "integer", "nullable": False, "description": "Quantity ordered"},
            {"name": "unit_price", "dataType": "decimal(10,2)", "nullable": True, "description": "Price per unit"},
            {"name": "discount", "dataType": "decimal(5,2)", "nullable": True, "description": "Discount percentage"},
        ],
        "config": {"path": "s3://data-lake/order_items/"},
        "tags": ["transactional", "sales"],
    },
    {
        "name": "events_stream",
        "description": "Real-time event stream from Kafka",
        "source_type": "kafka",
        "columns": [
            {"name": "event_id", "dataType": "string", "nullable": False, "description": "Event UUID"},
            {"name": "event_type", "dataType": "string", "nullable": False, "description": "Type of event"},
            {"name": "timestamp", "dataType": "timestamp", "nullable": False, "description": "Event timestamp"},
            {"name": "user_id", "dataType": "long", "nullable": True, "description": "User who triggered event"},
            {"name": "payload", "dataType": "string", "nullable": True, "description": "JSON payload"},
        ],
        "config": {"kafka.bootstrap.servers": "localhost:9092", "subscribe": "events", "startingOffsets": "latest"},
        "tags": ["streaming", "events"],
    },
]


@router.post("/workspaces/{workspace_id}/schemas/defaults", status_code=status.HTTP_201_CREATED)
async def load_default_schemas(workspace_id: str, db: AsyncSession = Depends(get_db)):
    """Load default/seed schemas into a workspace."""
    now = datetime.now(timezone.utc)

    # Verify workspace exists
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Check existing schemas to avoid duplicates
    result = await db.execute(
        select(SchemaDefinition.name).where(SchemaDefinition.workspace_id == workspace_id)
    )
    existing_names = set(row[0] for row in result.fetchall())

    created_schemas = []
    for schema_data in DEFAULT_SCHEMAS:
        # Skip if schema with same name already exists
        if schema_data["name"] in existing_names:
            continue

        schema_id = str(uuid.uuid4())
        schema = SchemaDefinition(
            id=schema_id,
            workspace_id=workspace_id,
            name=schema_data["name"],
            description=schema_data.get("description"),
            source_type=schema_data["source_type"],
            columns=schema_data["columns"],
            config=schema_data.get("config"),
            is_favorite=False,
            tags=schema_data.get("tags", []),
            created_at=now,
            updated_at=now,
        )
        db.add(schema)
        created_schemas.append(
            SchemaDefinitionResponse(
                id=schema_id,
                workspace_id=workspace_id,
                name=schema_data["name"],
                description=schema_data.get("description"),
                source_type=schema_data["source_type"],
                columns=schema_data["columns"],
                config=schema_data.get("config", {}),
                is_favorite=False,
                tags=schema_data.get("tags", []),
                created_at=now,
                updated_at=now,
            )
        )

    await db.flush()

    return {
        "loaded": len(created_schemas),
        "schemas": created_schemas,
    }
