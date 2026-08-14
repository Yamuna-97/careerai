"""
app/api/routes/users.py
────────────────────────
User profile management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse

router = APIRouter()


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get my profile",
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """Return the current user's profile."""
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update my profile",
)
def update_my_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """Update the current user's profile (full name, etc.)."""
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user
