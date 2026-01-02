from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
import uuid

from ..database import get_db
from ..models import Page, Workspace, WorkspaceMember, User
from ..schemas import (
    PageCreate,
    PageUpdate,
    PageResponse,
    PageListResponse,
)
from ..dependencies.auth import get_current_user_optional

router = APIRouter(prefix="/api", tags=["pages"])


async def check_workspace_permission(
    workspace_id: str,
    user: Optional[User],
    db: AsyncSession,
    require_edit: bool = False
) -> None:
    """Check if user has permission to access/edit workspace."""
    if not user:
        # Anonymous access - allow read only if not requiring edit
        if require_edit:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to edit"
            )
        return

    # Check user's role in workspace
    result = await db.execute(
        select(WorkspaceMember).where(
            and_(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user.id
            )
        )
    )
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this workspace"
        )

    if require_edit and member.role == "viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot edit this workspace"
        )


@router.get("/workspaces/{workspace_id}/pages", response_model=List[PageListResponse])
async def list_pages(workspace_id: str, db: AsyncSession = Depends(get_db)):
    """List all pages in a workspace."""
    # Verify workspace exists
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Workspace not found")

    result = await db.execute(
        select(Page)
        .where(Page.workspace_id == workspace_id)
        .order_by(Page.created_at)
    )
    pages = result.scalars().all()

    return [
        PageListResponse(
            id=p.id,
            workspace_id=p.workspace_id,
            name=p.name,
            node_count=len(p.nodes) if p.nodes else 0,
            edge_count=len(p.edges) if p.edges else 0,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )
        for p in pages
    ]


@router.post("/workspaces/{workspace_id}/pages", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
async def create_page(
    workspace_id: str,
    data: PageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Create a new page in a workspace."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    # Verify workspace exists
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Check edit permission (viewers cannot create pages)
    await check_workspace_permission(workspace_id, current_user, db, require_edit=True)

    page_id = str(uuid.uuid4())
    page = Page(
        id=page_id,
        workspace_id=workspace_id,
        name=data.name,
        nodes=data.nodes,
        edges=data.edges,
        created_at=now,
        updated_at=now,
    )
    db.add(page)
    await db.flush()

    return PageResponse(
        id=page_id,
        workspace_id=workspace_id,
        name=data.name,
        nodes=data.nodes or [],
        edges=data.edges or [],
        generated_code=None,
        created_at=now,
        updated_at=now,
    )


@router.get("/pages/{page_id}", response_model=PageResponse)
async def get_page(page_id: str, db: AsyncSession = Depends(get_db)):
    """Get a page by ID."""
    result = await db.execute(select(Page).where(Page.id == page_id))
    page = result.scalar_one_or_none()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    return PageResponse(
        id=page.id,
        workspace_id=page.workspace_id,
        name=page.name,
        nodes=page.nodes or [],
        edges=page.edges or [],
        generated_code=page.generated_code,
        created_at=page.created_at,
        updated_at=page.updated_at,
    )


@router.put("/pages/{page_id}", response_model=PageResponse)
async def update_page(
    page_id: str,
    data: PageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Update a page."""
    from datetime import datetime, timezone

    result = await db.execute(select(Page).where(Page.id == page_id))
    page = result.scalar_one_or_none()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    # Check edit permission (viewers cannot update pages)
    await check_workspace_permission(page.workspace_id, current_user, db, require_edit=True)

    if data.name is not None:
        page.name = data.name
    if data.nodes is not None:
        page.nodes = data.nodes
    if data.edges is not None:
        page.edges = data.edges
    page.updated_at = datetime.now(timezone.utc)

    await db.flush()

    return PageResponse(
        id=page.id,
        workspace_id=page.workspace_id,
        name=page.name,
        nodes=page.nodes or [],
        edges=page.edges or [],
        generated_code=page.generated_code,
        created_at=page.created_at,
        updated_at=page.updated_at,
    )


@router.delete("/pages/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_page(
    page_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Delete a page."""
    result = await db.execute(select(Page).where(Page.id == page_id))
    page = result.scalar_one_or_none()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    # Check edit permission (viewers cannot delete pages)
    await check_workspace_permission(page.workspace_id, current_user, db, require_edit=True)

    # Check if this is the last page in workspace
    result = await db.execute(
        select(Page).where(Page.workspace_id == page.workspace_id)
    )
    pages = result.scalars().all()

    if len(pages) <= 1:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the last page in a workspace"
        )

    await db.delete(page)


@router.post("/pages/{page_id}/duplicate", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_page(
    page_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Duplicate a page."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    result = await db.execute(select(Page).where(Page.id == page_id))
    original = result.scalar_one_or_none()

    if not original:
        raise HTTPException(status_code=404, detail="Page not found")

    # Check edit permission (viewers cannot duplicate pages)
    await check_workspace_permission(original.workspace_id, current_user, db, require_edit=True)

    # Create duplicate with new IDs for nodes
    new_nodes = []
    if original.nodes:
        for node in original.nodes:
            new_node = dict(node)
            new_node["id"] = str(uuid.uuid4())
            new_nodes.append(new_node)

    dup_id = str(uuid.uuid4())
    dup_name = f"{original.name} (Copy)"
    duplicate = Page(
        id=dup_id,
        workspace_id=original.workspace_id,
        name=dup_name,
        nodes=new_nodes,
        edges=[],  # Reset edges since node IDs changed
        created_at=now,
        updated_at=now,
    )
    db.add(duplicate)
    await db.flush()

    return PageResponse(
        id=dup_id,
        workspace_id=original.workspace_id,
        name=dup_name,
        nodes=new_nodes,
        edges=[],
        generated_code=None,
        created_at=now,
        updated_at=now,
    )
