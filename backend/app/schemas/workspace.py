from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class PageInWorkspace(BaseModel):
    """Page data when included in workspace response."""
    id: str
    name: str
    nodes: List[Any] = []
    edges: List[Any] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkspaceCreate(BaseModel):
    """Schema for creating a workspace."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class WorkspaceUpdate(BaseModel):
    """Schema for updating a workspace."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class WorkspaceResponse(BaseModel):
    """Schema for workspace response."""
    id: str
    name: str
    description: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    pages: List[PageInWorkspace] = []
    active_page_id: Optional[str] = None

    class Config:
        from_attributes = True


class WorkspaceOwnerInfo(BaseModel):
    """Owner information for workspace."""
    id: str
    name: str
    email: str


class WorkspaceListResponse(BaseModel):
    """Schema for workspace list response."""
    id: str
    name: str
    description: Optional[str] = None
    page_count: int = 0
    created_at: datetime
    updated_at: datetime
    my_role: str  # viewer, editor, owner
    owner: Optional[WorkspaceOwnerInfo] = None  # Owner info for shared workspaces

    class Config:
        from_attributes = True


class WorkspaceExport(BaseModel):
    """Schema for workspace export/import."""
    name: str
    description: Optional[str] = None
    pages: List[PageInWorkspace] = []
    active_page_id: Optional[str] = None
