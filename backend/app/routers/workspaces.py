from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from ..database import get_db
from ..models import Workspace, Page, WorkspaceMember, User
from ..schemas import (
    WorkspaceCreate,
    WorkspaceUpdate,
    WorkspaceResponse,
    WorkspaceListResponse,
    WorkspaceExport,
    WorkspaceOwnerInfo,
)
from ..dependencies.auth import get_current_user_optional

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


@router.get("", response_model=List[WorkspaceListResponse])
async def list_workspaces(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """List workspaces. Logged-in users see only their workspaces."""
    if not current_user:
        # Anonymous users see no workspaces (they need to create one)
        return []

    # Get workspaces where user is a member, with their role
    result = await db.execute(
        select(Workspace, WorkspaceMember.role)
        .join(WorkspaceMember, Workspace.id == WorkspaceMember.workspace_id)
        .options(selectinload(Workspace.pages))
        .where(WorkspaceMember.user_id == current_user.id)
        .order_by(Workspace.updated_at.desc())
    )
    workspace_data = result.all()

    response = []
    for workspace, my_role in workspace_data:
        owner_info = None

        # If user is not the owner, get owner info
        if my_role != "owner":
            owner_result = await db.execute(
                select(WorkspaceMember)
                .options(selectinload(WorkspaceMember.user))
                .where(
                    WorkspaceMember.workspace_id == workspace.id,
                    WorkspaceMember.role == "owner"
                )
            )
            owner_member = owner_result.scalar_one_or_none()
            if owner_member and owner_member.user:
                owner_info = WorkspaceOwnerInfo(
                    id=owner_member.user.id,
                    name=owner_member.user.name,
                    email=owner_member.user.email
                )

        response.append(WorkspaceListResponse(
            id=workspace.id,
            name=workspace.name,
            description=workspace.description,
            page_count=len(workspace.pages),
            created_at=workspace.created_at,
            updated_at=workspace.updated_at,
            my_role=my_role,
            owner=owner_info,
        ))

    return response


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    data: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Create a new workspace with a default page."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    workspace_id = str(uuid.uuid4())
    page_id = str(uuid.uuid4())

    workspace = Workspace(
        id=workspace_id,
        name=data.name,
        description=data.description,
        created_at=now,
        updated_at=now,
    )
    db.add(workspace)

    # Create default page
    default_page = Page(
        id=page_id,
        workspace_id=workspace_id,
        name="Page 1",
        nodes=[],
        edges=[],
        created_at=now,
        updated_at=now,
    )
    db.add(default_page)

    # If user is logged in, make them the owner
    if current_user:
        member = WorkspaceMember(
            id=str(uuid.uuid4()),
            workspace_id=workspace_id,
            user_id=current_user.id,
            role="owner",
            joined_at=now,
        )
        db.add(member)

    await db.flush()

    return WorkspaceResponse(
        id=workspace_id,
        name=data.name,
        description=data.description,
        created_by=current_user.id if current_user else None,
        created_at=now,
        updated_at=now,
        pages=[{
            "id": page_id,
            "name": "Page 1",
            "nodes": [],
            "edges": [],
            "created_at": now,
            "updated_at": now,
        }],
        active_page_id=page_id,
    )


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(workspace_id: str, db: AsyncSession = Depends(get_db)):
    """Get a workspace by ID."""
    result = await db.execute(
        select(Workspace)
        .options(selectinload(Workspace.pages))
        .where(Workspace.id == workspace_id)
    )
    workspace = result.scalar_one_or_none()

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    return WorkspaceResponse(
        id=workspace.id,
        name=workspace.name,
        description=workspace.description,
        created_by=workspace.created_by,
        created_at=workspace.created_at,
        updated_at=workspace.updated_at,
        pages=[{
            "id": p.id,
            "name": p.name,
            "nodes": p.nodes or [],
            "edges": p.edges or [],
            "created_at": p.created_at,
            "updated_at": p.updated_at,
        } for p in workspace.pages],
        active_page_id=workspace.pages[0].id if workspace.pages else None,
    )


@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    data: WorkspaceUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a workspace."""
    from datetime import datetime, timezone

    result = await db.execute(
        select(Workspace)
        .options(selectinload(Workspace.pages))
        .where(Workspace.id == workspace_id)
    )
    workspace = result.scalar_one_or_none()

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if data.name is not None:
        workspace.name = data.name
    if data.description is not None:
        workspace.description = data.description
    workspace.updated_at = datetime.now(timezone.utc)

    await db.flush()

    return WorkspaceResponse(
        id=workspace.id,
        name=workspace.name,
        description=workspace.description,
        created_by=workspace.created_by,
        created_at=workspace.created_at,
        updated_at=workspace.updated_at,
        pages=[{
            "id": p.id,
            "name": p.name,
            "nodes": p.nodes or [],
            "edges": p.edges or [],
            "created_at": p.created_at,
            "updated_at": p.updated_at,
        } for p in workspace.pages],
        active_page_id=workspace.pages[0].id if workspace.pages else None,
    )


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(workspace_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a workspace."""
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    workspace = result.scalar_one_or_none()

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    await db.delete(workspace)


@router.post("/{workspace_id}/claim")
async def claim_workspace(
    workspace_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Claim ownership of an unclaimed workspace (no existing members)."""
    from datetime import datetime, timezone

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Must be logged in to claim a workspace"
        )

    # Check workspace exists
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Check if workspace already has members
    members_result = await db.execute(
        select(WorkspaceMember).where(WorkspaceMember.workspace_id == workspace_id)
    )
    existing_members = members_result.scalars().all()

    if existing_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workspace already has an owner"
        )

    # Claim the workspace
    member = WorkspaceMember(
        id=str(uuid.uuid4()),
        workspace_id=workspace_id,
        user_id=current_user.id,
        role="owner",
        joined_at=datetime.now(timezone.utc),
    )
    db.add(member)
    await db.commit()

    return {"message": "Workspace claimed successfully", "workspace_id": workspace_id}


@router.get("/{workspace_id}/export", response_model=WorkspaceExport)
async def export_workspace(workspace_id: str, db: AsyncSession = Depends(get_db)):
    """Export a workspace as JSON."""
    result = await db.execute(
        select(Workspace)
        .options(selectinload(Workspace.pages))
        .where(Workspace.id == workspace_id)
    )
    workspace = result.scalar_one_or_none()

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    return WorkspaceExport(
        name=workspace.name,
        description=workspace.description,
        pages=[{
            "id": p.id,
            "name": p.name,
            "nodes": p.nodes or [],
            "edges": p.edges or [],
            "created_at": p.created_at,
            "updated_at": p.updated_at,
        } for p in workspace.pages],
        active_page_id=workspace.pages[0].id if workspace.pages else None,
    )


@router.post("/import", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def import_workspace(data: WorkspaceExport, db: AsyncSession = Depends(get_db)):
    """Import a workspace from JSON."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    workspace_id = str(uuid.uuid4())
    workspace = Workspace(
        id=workspace_id,
        name=f"{data.name} (Imported)",
        description=data.description,
        created_at=now,
        updated_at=now,
    )
    db.add(workspace)

    # Create pages
    pages_list = []
    first_page_id = None
    for page_data in data.pages:
        page_id = str(uuid.uuid4())
        page = Page(
            id=page_id,
            workspace_id=workspace_id,
            name=page_data.name,
            nodes=page_data.nodes,
            edges=page_data.edges,
            created_at=now,
            updated_at=now,
        )
        db.add(page)
        pages_list.append({
            "id": page_id,
            "name": page_data.name,
            "nodes": page_data.nodes or [],
            "edges": page_data.edges or [],
            "created_at": now,
            "updated_at": now,
        })
        if first_page_id is None:
            first_page_id = page_id

    # If no pages provided, create a default one
    if not data.pages:
        page_id = str(uuid.uuid4())
        default_page = Page(
            id=page_id,
            workspace_id=workspace_id,
            name="Page 1",
            nodes=[],
            edges=[],
            created_at=now,
            updated_at=now,
        )
        db.add(default_page)
        first_page_id = page_id
        pages_list.append({
            "id": page_id,
            "name": "Page 1",
            "nodes": [],
            "edges": [],
            "created_at": now,
            "updated_at": now,
        })

    await db.flush()

    return WorkspaceResponse(
        id=workspace_id,
        name=f"{data.name} (Imported)",
        description=data.description,
        created_by=None,
        created_at=now,
        updated_at=now,
        pages=pages_list,
        active_page_id=first_page_id,
    )
