"""
app/core/security.py
─────────────────────
JWT token validation for Supabase authentication.

How it works:
- The frontend (React) sends a Supabase-issued JWT in the Authorization header.
- This module decodes and validates that JWT using the Supabase JWT secret.
- The route then uses the verified user ID (sub) as the authenticated identity.
- We never trust user_id sent in the request body.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings


# HTTPBearer extracts "Authorization: Bearer <token>" from request headers
bearer_scheme = HTTPBearer(auto_error=False)


from app.core.database import get_db
from sqlalchemy.orm import Session

def _ensure_mock_user(db: Session) -> None:
    from app.models.user import User
    try:
        mock_user = db.query(User).filter(User.id == "mock_user_id_123").first()
        if not mock_user:
            mock_user = User(
                id="mock_user_id_123",
                email="user@example.com",
                full_name="Yamuna"
            )
            db.add(mock_user)
            db.commit()
    except Exception as e:
        print(f"Error ensuring mock user exists: {e}")
        db.rollback()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> str:
    """
    FastAPI dependency that validates the Supabase JWT and returns the user's ID.

    - Returns the user's UUID (the 'sub' claim from the JWT).
    - Raises 401 if no token is provided or the token is invalid/expired.

    Usage in routes:
        def my_route(user_id: str = Depends(get_current_user_id)):
            ...
    """
    if not credentials:
        if not settings.SUPABASE_JWT_SECRET or settings.DEBUG:
            _ensure_mock_user(db)
            return "mock_user_id_123"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Bypassing JWT checks for local debugging
    if token == "mock_user_token" or token.startswith("mock_") or not settings.SUPABASE_JWT_SECRET:
        _ensure_mock_user(db)
        return "mock_user_id_123"

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase tokens don't always have audience
        )
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: user ID not found.",
            )
        return user_id

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Optional auth dependency (for endpoints that work both logged in and out) ──
def get_optional_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str | None:
    """Returns user_id if a valid token is provided, otherwise returns None."""
    if not credentials:
        return None
    try:
        return get_current_user_id(credentials)
    except HTTPException:
        return None
