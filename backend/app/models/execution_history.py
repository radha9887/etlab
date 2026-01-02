from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
import uuid

from ..database import Base


class ExecutionHistory(Base):
    """Execution history model - tracks code execution runs."""

    __tablename__ = "execution_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # No foreign keys - page_id and spark_connection_id are just reference strings
    # This allows execution from localStorage pages that don't exist in DB
    page_id = Column(String(36), nullable=True)
    spark_connection_id = Column(String(36), nullable=True)
    code = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="pending")  # pending, running, success, failed, cancelled
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    logs = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ExecutionHistory(id={self.id}, status={self.status})>"
