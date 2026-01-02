from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..database import Base


class Workspace(Base):
    """Workspace model - contains multiple pages."""

    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True)  # Owner of the workspace
    created_by = Column(String(255), nullable=True)  # Legacy field
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="owned_workspaces", foreign_keys=[owner_id])
    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    share_links = relationship("WorkspaceShareLink", back_populates="workspace", cascade="all, delete-orphan")
    pages = relationship("Page", back_populates="workspace", cascade="all, delete-orphan")
    schemas = relationship("SchemaDefinition", back_populates="workspace", cascade="all, delete-orphan")
    dag_definitions = relationship("DagDefinition", back_populates="workspace", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Workspace(id={self.id}, name={self.name})>"
