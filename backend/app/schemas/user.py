from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ============================================
# User Schemas
# ============================================

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response."""
    id: str
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserBrief(BaseModel):
    """Brief user info for lists."""
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================
# Auth Schemas
# ============================================

class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str


class AccessTokenResponse(BaseModel):
    """Schema for access token response."""
    access_token: str
    token_type: str = "bearer"


# ============================================
# Workspace Member Schemas
# ============================================

class WorkspaceMemberBase(BaseModel):
    """Base workspace member schema."""
    role: str = Field(..., pattern="^(owner|editor|viewer)$")


class WorkspaceMemberCreate(WorkspaceMemberBase):
    """Schema for adding a member."""
    user_id: str


class WorkspaceMemberUpdate(BaseModel):
    """Schema for updating member role."""
    role: str = Field(..., pattern="^(owner|editor|viewer)$")


class WorkspaceMemberResponse(WorkspaceMemberBase):
    """Schema for workspace member response."""
    id: str
    workspace_id: str
    user_id: str
    user: UserBrief
    joined_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Share Link Schemas
# ============================================

class ShareLinkCreate(BaseModel):
    """Schema for creating a share link."""
    role: str = Field(..., pattern="^(editor|viewer)$")
    expires_in_days: Optional[int] = Field(None, ge=1, le=365)
    max_uses: Optional[int] = Field(None, ge=1)


class ShareLinkResponse(BaseModel):
    """Schema for share link response."""
    id: str
    workspace_id: str
    token: str
    role: str
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = None
    use_count: int
    is_active: bool
    created_at: datetime
    share_url: str  # Full URL for sharing

    class Config:
        from_attributes = True


class ShareLinkInfo(BaseModel):
    """Public info about a share link."""
    workspace_name: str
    workspace_id: str
    role: str
    is_valid: bool
    message: Optional[str] = None
