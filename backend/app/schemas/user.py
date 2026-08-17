"""
app/schemas/user.py
────────────────────
Pydantic schemas for User API request/response validation.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None
    title: str | None = None
    phone: str | None = None
    location: str | None = None
    bio: str | None = None
    linkedin: str | None = None
    github: str | None = None
    portfolio: str | None = None


class UserCreate(UserBase):
    """Used when creating a user profile after Supabase auth signup."""
    id: str  # The Supabase Auth UUID


class UserUpdate(BaseModel):
    """Used when updating user profile."""
    full_name: str | None = None
    avatar_url: str | None = None
    title: str | None = None
    phone: str | None = None
    location: str | None = None
    bio: str | None = None
    linkedin: str | None = None
    github: str | None = None
    portfolio: str | None = None


class UserResponse(UserBase):
    """Returned by the API."""
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
