from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models import User, Workspace, WorkspaceMember, WorkspaceShareLink
from ..schemas.user import (
    WorkspaceMemberResponse,
    WorkspaceMemberCreate,
    WorkspaceMemberUpdate,
    ShareLinkCreate,
    ShareLinkResponse,
    ShareLinkInfo,
    UserBrief,
)
from ..dependencies.auth import get_current_active_user
from ..utils.auth import generate_share_token

router = APIRouter(tags=["Workspace Members"])


# ============================================
# Permission Helpers
# ============================================

async def get_user_workspace_role(
    workspace_id: str,
    user_id: str,
    db: AsyncSession
) -> Optional[str]:
    """Get user's role in a workspace."""
    result = await db.execute(
        select(WorkspaceMember).where(
            and_(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user_id
            )
        )
    )
    member = result.scalar_one_or_none()
    return member.role if member else None


async def require_workspace_owner(
    workspace_id: str,
    user: User,
    db: AsyncSession
) -> Workspace:
    """Require user to be workspace owner."""
    role = await get_user_workspace_role(workspace_id, user.id, db)
    if role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace owner can perform this action"
        )

    result = await db.execute(
        select(Workspace).where(Workspace.id == workspace_id)
    )
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    return workspace


async def require_workspace_member(
    workspace_id: str,
    user: User,
    db: AsyncSession,
    min_role: str = "viewer"
) -> str:
    """Require user to be a workspace member with minimum role."""
    role = await get_user_workspace_role(workspace_id, user.id, db)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this workspace"
        )

    role_hierarchy = {"viewer": 0, "editor": 1, "owner": 2}
    if role_hierarchy.get(role, 0) < role_hierarchy.get(min_role, 0):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Requires {min_role} role or higher"
        )

    return role


# ============================================
# Member Management Endpoints
# ============================================

@router.get("/api/workspaces/{workspace_id}/members", response_model=List[WorkspaceMemberResponse])
async def list_workspace_members(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List all members of a workspace."""
    await require_workspace_member(workspace_id, current_user, db)

    result = await db.execute(
        select(WorkspaceMember)
        .options(selectinload(WorkspaceMember.user))
        .where(WorkspaceMember.workspace_id == workspace_id)
    )
    members = result.scalars().all()

    return [
        WorkspaceMemberResponse(
            id=m.id,
            workspace_id=m.workspace_id,
            user_id=m.user_id,
            role=m.role,
            joined_at=m.joined_at,
            user=UserBrief(
                id=m.user.id,
                email=m.user.email,
                name=m.user.name,
                avatar_url=m.user.avatar_url
            )
        )
        for m in members
    ]


@router.post("/api/workspaces/{workspace_id}/members", response_model=WorkspaceMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_workspace_member(
    workspace_id: str,
    data: WorkspaceMemberCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a member to a workspace directly. Only owner can add members."""
    await require_workspace_owner(workspace_id, current_user, db)

    # Check if user exists
    user_result = await db.execute(
        select(User).where(User.id == data.user_id)
    )
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if already a member
    existing_result = await db.execute(
        select(WorkspaceMember).where(
            and_(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == data.user_id
            )
        )
    )
    existing = existing_result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this workspace"
        )

    # Cannot add someone as owner directly
    if data.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add member as owner. Use role update to transfer ownership."
        )

    # Create new member
    member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=data.user_id,
        role=data.role
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)

    return WorkspaceMemberResponse(
        id=member.id,
        workspace_id=member.workspace_id,
        user_id=member.user_id,
        role=member.role,
        joined_at=member.joined_at,
        user=UserBrief(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url
        )
    )


@router.put("/api/workspaces/{workspace_id}/members/{user_id}")
async def update_member_role(
    workspace_id: str,
    user_id: str,
    data: WorkspaceMemberUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a member's role. Only owner can do this."""
    await require_workspace_owner(workspace_id, current_user, db)

    if user_id == current_user.id and data.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote yourself. Transfer ownership first."
        )

    result = await db.execute(
        select(WorkspaceMember).where(
            and_(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user_id
            )
        )
    )
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    # If promoting to owner, demote current owner to editor
    if data.role == "owner" and member.role != "owner":
        current_owner_result = await db.execute(
            select(WorkspaceMember).where(
                and_(
                    WorkspaceMember.workspace_id == workspace_id,
                    WorkspaceMember.user_id == current_user.id
                )
            )
        )
        current_owner_member = current_owner_result.scalar_one()
        current_owner_member.role = "editor"

    member.role = data.role
    await db.commit()

    return {"message": f"Role updated to {data.role}"}


@router.delete("/api/workspaces/{workspace_id}/members/{user_id}")
async def remove_member(
    workspace_id: str,
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a member from workspace. Owner can remove anyone, members can leave."""
    role = await get_user_workspace_role(workspace_id, current_user.id, db)

    if not role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this workspace"
        )

    # Check if user is removing themselves (leaving)
    is_self = user_id == current_user.id

    if not is_self and role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owner can remove other members"
        )

    result = await db.execute(
        select(WorkspaceMember).where(
            and_(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user_id
            )
        )
    )
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    if member.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove owner. Transfer ownership first."
        )

    await db.delete(member)
    await db.commit()

    return {"message": "Member removed successfully"}


@router.post("/api/workspaces/{workspace_id}/leave")
async def leave_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Leave a workspace."""
    role = await get_user_workspace_role(workspace_id, current_user.id, db)

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not a member of this workspace"
        )

    if role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner cannot leave. Transfer ownership or delete workspace."
        )

    result = await db.execute(
        select(WorkspaceMember).where(
            and_(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == current_user.id
            )
        )
    )
    member = result.scalar_one()

    await db.delete(member)
    await db.commit()

    return {"message": "Left workspace successfully"}


# ============================================
# Share Link Endpoints
# ============================================

@router.get("/api/workspaces/{workspace_id}/share-links", response_model=List[ShareLinkResponse])
async def list_share_links(
    workspace_id: str,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List all share links for a workspace. Only owner can see links."""
    await require_workspace_owner(workspace_id, current_user, db)

    result = await db.execute(
        select(WorkspaceShareLink).where(
            WorkspaceShareLink.workspace_id == workspace_id
        )
    )
    links = result.scalars().all()

    base_url = str(request.base_url).rstrip("/")

    return [
        ShareLinkResponse(
            id=link.id,
            workspace_id=link.workspace_id,
            token=link.token,
            role=link.role,
            expires_at=link.expires_at,
            max_uses=int(link.max_uses) if link.max_uses else None,
            use_count=int(link.use_count) if link.use_count else 0,
            is_active=link.is_active,
            created_at=link.created_at,
            share_url=f"{base_url}/share/{link.token}"
        )
        for link in links
    ]


@router.post("/api/workspaces/{workspace_id}/share-links", response_model=ShareLinkResponse)
async def create_share_link(
    workspace_id: str,
    data: ShareLinkCreate,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new share link. Only owner can create links."""
    await require_workspace_owner(workspace_id, current_user, db)

    expires_at = None
    if data.expires_in_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=data.expires_in_days)

    link = WorkspaceShareLink(
        workspace_id=workspace_id,
        token=generate_share_token(),
        role=data.role,
        created_by=current_user.id,
        expires_at=expires_at,
        max_uses=str(data.max_uses) if data.max_uses else None,
    )

    db.add(link)
    await db.commit()
    await db.refresh(link)

    base_url = str(request.base_url).rstrip("/")

    return ShareLinkResponse(
        id=link.id,
        workspace_id=link.workspace_id,
        token=link.token,
        role=link.role,
        expires_at=link.expires_at,
        max_uses=int(link.max_uses) if link.max_uses else None,
        use_count=int(link.use_count) if link.use_count else 0,
        is_active=link.is_active,
        created_at=link.created_at,
        share_url=f"{base_url}/share/{link.token}"
    )


@router.delete("/api/workspaces/{workspace_id}/share-links/{link_id}")
async def revoke_share_link(
    workspace_id: str,
    link_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke a share link."""
    await require_workspace_owner(workspace_id, current_user, db)

    result = await db.execute(
        select(WorkspaceShareLink).where(
            and_(
                WorkspaceShareLink.id == link_id,
                WorkspaceShareLink.workspace_id == workspace_id
            )
        )
    )
    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found"
        )

    await db.delete(link)
    await db.commit()

    return {"message": "Share link revoked"}


# ============================================
# Public Share Link Endpoints
# ============================================

@router.get("/api/share/{token}", response_model=ShareLinkInfo)
async def get_share_link_info(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """Get information about a share link (public endpoint)."""
    result = await db.execute(
        select(WorkspaceShareLink)
        .options(selectinload(WorkspaceShareLink.workspace))
        .where(WorkspaceShareLink.token == token)
    )
    link = result.scalar_one_or_none()

    if not link:
        return ShareLinkInfo(
            workspace_name="",
            workspace_id="",
            role="",
            is_valid=False,
            message="Invalid or expired share link"
        )

    if not link.is_active:
        return ShareLinkInfo(
            workspace_name=link.workspace.name,
            workspace_id=link.workspace_id,
            role=link.role,
            is_valid=False,
            message="This share link has been deactivated"
        )

    if link.expires_at and datetime.now(timezone.utc) > link.expires_at:
        return ShareLinkInfo(
            workspace_name=link.workspace.name,
            workspace_id=link.workspace_id,
            role=link.role,
            is_valid=False,
            message="This share link has expired"
        )

    if link.max_uses:
        use_count = int(link.use_count) if link.use_count else 0
        max_uses = int(link.max_uses)
        if use_count >= max_uses:
            return ShareLinkInfo(
                workspace_name=link.workspace.name,
                workspace_id=link.workspace_id,
                role=link.role,
                is_valid=False,
                message="This share link has reached its maximum uses"
            )

    return ShareLinkInfo(
        workspace_name=link.workspace.name,
        workspace_id=link.workspace_id,
        role=link.role,
        is_valid=True
    )


@router.post("/api/share/{token}/join")
async def join_via_share_link(
    token: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Join a workspace via share link."""
    result = await db.execute(
        select(WorkspaceShareLink)
        .options(selectinload(WorkspaceShareLink.workspace))
        .where(WorkspaceShareLink.token == token)
    )
    link = result.scalar_one_or_none()

    if not link or not link.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or inactive share link"
        )

    if link.expires_at and datetime.now(timezone.utc) > link.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Share link has expired"
        )

    if link.max_uses:
        use_count = int(link.use_count) if link.use_count else 0
        max_uses = int(link.max_uses)
        if use_count >= max_uses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Share link has reached maximum uses"
            )

    # Check if already a member
    existing = await db.execute(
        select(WorkspaceMember).where(
            and_(
                WorkspaceMember.workspace_id == link.workspace_id,
                WorkspaceMember.user_id == current_user.id
            )
        )
    )
    if existing.scalar_one_or_none():
        return {
            "message": "Already a member of this workspace",
            "workspace_id": link.workspace_id,
            "workspace_name": link.workspace.name
        }

    # Add as member
    member = WorkspaceMember(
        workspace_id=link.workspace_id,
        user_id=current_user.id,
        role=link.role
    )
    db.add(member)

    # Increment use count
    link.use_count = str(int(link.use_count or "0") + 1)

    await db.commit()

    return {
        "message": f"Joined workspace as {link.role}",
        "workspace_id": link.workspace_id,
        "workspace_name": link.workspace.name
    }
