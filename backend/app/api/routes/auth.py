"""
app/api/routes/auth.py
───────────────────────
Authentication endpoints.

Authentication is handled by Supabase on the frontend.
This backend validates Supabase JWTs and creates/syncs user profiles.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()


@router.post(
    "/sync",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Sync Supabase user to local database",
)
def sync_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Called after Supabase login to ensure the user exists in our database.
    Creates a new profile if first time, or returns existing profile.

    The user_id in the JWT must match the id in the request body.
    """
    # Security: ensure the token matches the requested user ID
    if current_user_id != user_data.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token user ID does not match request user ID.",
        )

    # Check if user already exists
    existing_user = db.query(User).filter(User.id == user_data.id).first()
    if existing_user:
        return existing_user

    # Create new user profile
    new_user = User(
        id=user_data.id,
        email=user_data.email,
        full_name=user_data.full_name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
)
def get_me(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """Return the profile of the currently authenticated user."""
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please call /auth/sync first.",
        )
    return user
