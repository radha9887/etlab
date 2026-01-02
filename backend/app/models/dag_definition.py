"""
DAG Definition Model - Stores Airflow DAG definitions
"""
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..database import Base


class DagDefinition(Base):
    """
    Stores DAG definitions created in the visual DAG designer.
    """
    __tablename__ = "dag_definitions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    page_id = Column(String(36), unique=True, nullable=True)  # Reference to DagPage in frontend

    # DAG identification
    dag_id = Column(String(255), nullable=False)  # Airflow DAG ID
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # DAG configuration (JSON)
    dag_config = Column(JSON, nullable=False, default=dict)
    # Contains: schedule, defaultArgs, startDate, catchup, maxActiveRuns, tags

    # Tasks and edges (JSON arrays)
    tasks = Column(JSON, nullable=False, default=list)  # Array of task node definitions
    edges = Column(JSON, nullable=False, default=list)  # Array of edge definitions

    # Generated code
    generated_code = Column(Text, nullable=True)

    # Sync status
    is_synced = Column(Boolean, default=False)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    sync_error = Column(Text, nullable=True)

    # Metadata
    is_active = Column(Boolean, default=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="dag_definitions")
    executions = relationship("DagExecution", back_populates="dag_definition", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<DagDefinition(id={self.id}, dag_id={self.dag_id}, workspace_id={self.workspace_id})>"


class DagExecution(Base):
    """
    Tracks DAG execution history (from Airflow).
    """
    __tablename__ = "dag_executions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dag_definition_id = Column(String(36), ForeignKey("dag_definitions.id", ondelete="CASCADE"), nullable=False)

    # Airflow execution info
    dag_run_id = Column(String(255), nullable=True)  # Airflow run ID
    execution_date = Column(DateTime(timezone=True), nullable=True)

    # Status
    status = Column(String(50), nullable=False, default="pending")
    # Status values: pending, running, success, failed, skipped

    # Timing
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Results
    logs = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    task_states = Column(JSON, nullable=True)  # Per-task status

    # Metadata
    triggered_by = Column(String(100), nullable=True)  # manual, scheduled, api
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    dag_definition = relationship("DagDefinition", back_populates="executions")

    def __repr__(self):
        return f"<DagExecution(id={self.id}, dag_run_id={self.dag_run_id}, status={self.status})>"
