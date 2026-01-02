"""
DAG Definition Schemas - Pydantic models for API
"""
from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


# ============================================
# DAG Config Schemas
# ============================================

class DagScheduleConfig(BaseModel):
    type: str = "manual"  # cron, preset, manual
    cron: Optional[str] = None
    preset: Optional[str] = None


class DagDefaultArgs(BaseModel):
    owner: str = "etl_factory"
    retries: int = 1
    retryDelayMinutes: int = 5
    executionTimeoutMinutes: int = 60
    email: Optional[str] = None
    emailOnFailure: bool = False
    emailOnRetry: bool = False


class DagConfigSchema(BaseModel):
    dagId: str
    description: str = ""
    schedule: DagScheduleConfig = Field(default_factory=DagScheduleConfig)
    defaultArgs: DagDefaultArgs = Field(default_factory=DagDefaultArgs)
    startDate: str = ""
    catchup: bool = False
    maxActiveRuns: int = 1
    tags: List[str] = Field(default_factory=list)


# ============================================
# Task Schemas
# ============================================

class DagTaskSchema(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    position: Dict[str, float]


class DagEdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None


# ============================================
# DAG Definition CRUD Schemas
# ============================================

class DagDefinitionBase(BaseModel):
    dag_id: str
    name: str
    description: Optional[str] = None


class DagDefinitionCreate(DagDefinitionBase):
    page_id: Optional[str] = None
    dag_config: Dict[str, Any] = Field(default_factory=dict)
    tasks: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)
    generated_code: Optional[str] = None


class DagDefinitionUpdate(BaseModel):
    dag_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    dag_config: Optional[Dict[str, Any]] = None
    tasks: Optional[List[Dict[str, Any]]] = None
    edges: Optional[List[Dict[str, Any]]] = None
    generated_code: Optional[str] = None
    is_active: Optional[bool] = None


class DagDefinitionResponse(DagDefinitionBase):
    id: str
    workspace_id: str
    page_id: Optional[str] = None
    dag_config: Dict[str, Any]
    tasks: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    generated_code: Optional[str] = None
    is_synced: bool
    last_synced_at: Optional[datetime] = None
    sync_error: Optional[str] = None
    is_active: bool
    version: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DagDefinitionList(BaseModel):
    dags: List[DagDefinitionResponse]
    total: int


# ============================================
# DAG Execution Schemas
# ============================================

class DagExecutionCreate(BaseModel):
    triggered_by: str = "manual"


class DagExecutionResponse(BaseModel):
    id: str
    dag_definition_id: str
    dag_run_id: Optional[str] = None
    execution_date: Optional[datetime] = None
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    logs: Optional[str] = None
    error_message: Optional[str] = None
    task_states: Optional[Dict[str, Any]] = None
    triggered_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DagExecutionList(BaseModel):
    executions: List[DagExecutionResponse]
    total: int


# ============================================
# Sync Schemas
# ============================================

class DagSyncRequest(BaseModel):
    force: bool = False


class DagSyncResponse(BaseModel):
    success: bool
    message: str
    file_path: Optional[str] = None
    synced_at: Optional[datetime] = None
