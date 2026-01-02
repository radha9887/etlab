from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SchemaColumn(BaseModel):
    """Column definition within a schema."""
    name: str = Field(..., min_length=1, max_length=255)
    dataType: str = Field(..., min_length=1, max_length=100)
    nullable: bool = True
    description: Optional[str] = None


class SchemaDefinitionBase(BaseModel):
    """Base schema for SchemaDefinition."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    source_type: str = Field(..., min_length=1, max_length=50)
    columns: List[SchemaColumn] = Field(default_factory=list)
    config: Optional[Dict[str, Any]] = Field(default_factory=dict)
    is_favorite: bool = False
    tags: List[str] = Field(default_factory=list)


class SchemaDefinitionCreate(SchemaDefinitionBase):
    """Schema for creating a new SchemaDefinition."""
    workspace_id: str


class SchemaDefinitionUpdate(BaseModel):
    """Schema for updating a SchemaDefinition."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    source_type: Optional[str] = Field(None, min_length=1, max_length=50)
    columns: Optional[List[SchemaColumn]] = None
    config: Optional[Dict[str, Any]] = None
    is_favorite: Optional[bool] = None
    tags: Optional[List[str]] = None


class SchemaDefinitionResponse(SchemaDefinitionBase):
    """Schema for SchemaDefinition responses."""
    id: str
    workspace_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SchemaDefinitionListResponse(BaseModel):
    """Response for listing schemas."""
    schemas: List[SchemaDefinitionResponse]
    total: int
