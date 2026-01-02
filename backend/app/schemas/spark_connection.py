from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class SparkConnectionCreate(BaseModel):
    """Schema for creating a Spark connection."""
    name: str = Field(..., min_length=1, max_length=255)
    connection_type: str = Field(..., min_length=1, max_length=50)
    master_url: Optional[str] = None
    config: Dict[str, Any] = {}
    is_default: bool = False


class SparkConnectionUpdate(BaseModel):
    """Schema for updating a Spark connection."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    connection_type: Optional[str] = Field(None, min_length=1, max_length=50)
    master_url: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = None


class SparkConnectionResponse(BaseModel):
    """Schema for Spark connection response."""
    id: str
    name: str
    connection_type: str
    master_url: Optional[str] = None
    config: Dict[str, Any] = {}
    is_default: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SparkConnectionListResponse(BaseModel):
    """Schema for Spark connection list response."""
    id: str
    name: str
    connection_type: str
    master_url: Optional[str] = None
    is_default: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class SparkConnectionTest(BaseModel):
    """Schema for Spark connection test result."""
    success: bool
    message: str
    details: Optional[Dict[str, Any]] = None
