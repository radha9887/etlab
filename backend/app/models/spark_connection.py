from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..database import Base


class SparkConnection(Base):
    """Spark connection configuration model."""

    __tablename__ = "spark_connections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    connection_type = Column(String(50), nullable=False)  # local, standalone, yarn, k8s, databricks, livy, etc.
    master_url = Column(String(500), nullable=True)
    config = Column(JSON, default=dict)  # Additional Spark configurations
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<SparkConnection(id={self.id}, name={self.name}, type={self.connection_type})>"
