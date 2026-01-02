from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..database import Base


class SchemaDefinition(Base):
    """
    SchemaDefinition model - represents a reusable schema definition.

    Schemas can be saved and reused across multiple sources in the workspace.
    Each schema has a name, source type, and list of columns with their data types.
    """

    __tablename__ = "schema_definitions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source_type = Column(String(50), nullable=False)  # csv, parquet, json, etc.

    # Schema columns stored as JSON array
    # Format: [{"name": "col1", "dataType": "string", "nullable": true, "description": "..."}, ...]
    columns = Column(JSON, default=list, nullable=False)

    # Optional configuration for the source (path patterns, etc.)
    config = Column(JSON, default=dict, nullable=True)

    # Metadata
    is_favorite = Column(Boolean, default=False)
    tags = Column(JSON, default=list)  # List of tag strings for categorization

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="schemas")

    def __repr__(self):
        return f"<SchemaDefinition(id={self.id}, name={self.name}, source_type={self.source_type})>"
