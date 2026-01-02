from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..database import Base


class WorkspaceMember(Base):
    """Workspace member model for sharing workspaces."""

    __tablename__ = "workspace_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # 'owner', 'editor', 'viewer'
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="workspace_memberships")

    __table_args__ = (
        UniqueConstraint('workspace_id', 'user_id', name='unique_workspace_member'),
    )

    def __repr__(self):
        return f"<WorkspaceMember(workspace_id={self.workspace_id}, user_id={self.user_id}, role={self.role})>"


class WorkspaceShareLink(Base):
    """Share link model for workspace sharing via link."""

    __tablename__ = "workspace_share_links"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(64), unique=True, nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'editor', 'viewer'
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # NULL = never expires
    max_uses = Column(String(10), nullable=True)  # NULL = unlimited
    use_count = Column(String(10), default="0")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="share_links")
    creator = relationship("User")

    def __repr__(self):
        return f"<WorkspaceShareLink(workspace_id={self.workspace_id}, token={self.token[:8]}...)>"
