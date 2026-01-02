from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..database import Base


class Page(Base):
    """Page model - represents an ETL pipeline within a workspace."""

    __tablename__ = "pages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    nodes = Column(JSON, default=list)  # React Flow nodes
    edges = Column(JSON, default=list)  # React Flow edges
    generated_code = Column(Text, nullable=True)  # Cached PySpark code
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="pages")

    def __repr__(self):
        return f"<Page(id={self.id}, name={self.name}, workspace_id={self.workspace_id})>"
