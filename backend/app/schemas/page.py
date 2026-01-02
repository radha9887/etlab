from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class PageCreate(BaseModel):
    """Schema for creating a page."""
    name: str = Field(..., min_length=1, max_length=255)
    nodes: List[Any] = []
    edges: List[Any] = []


class PageUpdate(BaseModel):
    """Schema for updating a page."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    nodes: Optional[List[Any]] = None
    edges: Optional[List[Any]] = None


class PageResponse(BaseModel):
    """Schema for page response."""
    id: str
    workspace_id: str
    name: str
    nodes: List[Any] = []
    edges: List[Any] = []
    generated_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PageListResponse(BaseModel):
    """Schema for page list response."""
    id: str
    workspace_id: str
    name: str
    node_count: int = 0
    edge_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
