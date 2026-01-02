from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ExecutionCreate(BaseModel):
    """Schema for creating an execution."""
    page_id: Optional[str] = None
    spark_connection_id: Optional[str] = None
    code: str


class ExecutionResponse(BaseModel):
    """Schema for execution response."""
    id: str
    page_id: Optional[str] = None
    spark_connection_id: Optional[str] = None
    code: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    logs: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ExecutionListResponse(BaseModel):
    """Schema for execution list response."""
    id: str
    page_id: Optional[str] = None
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
