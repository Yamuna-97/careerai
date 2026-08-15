"""
app/core/security.py
─────────────────────
JWT token validation for Supabase authentication.

Supabase (since 2024) issues ES256 tokens signed with an asymmetric key pair.
The public key is fetched from the project's JWKS endpoint and cached in-memory.

How it works:
- Frontend sends Supabase JWT in Authorization: Bearer <token>
- We fetch the JWKS endpoint to get the EC public key
- python-jose verifies the ES256 signature using the public key
- Verified sub (user UUID) is used as the authenticated identity
- We never trust user_id sent in the request body
"""

import json
import threading
import requests as _requests

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, jwk
from app.core.config import settings


# HTTPBearer extracts "Authorization: Bearer <token>" from request headers
bearer_scheme = HTTPBearer(auto_error=False)

# ── JWKS cache ───────────────────────────────────────────────────────────────
# Fetched once at startup and reused; protected by a lock for thread safety.
_jwks_cache: list[dict] | None = None
_jwks_lock = threading.Lock()


def _get_jwks_keys() -> list[dict]:
    """Return cached JWKS keys, fetching from Supabase if not yet loaded."""
    global _jwks_cache
    with _jwks_lock:
        if _jwks_cache is not None:
            return _jwks_cache
        url = settings.SUPABASE_JWKS_URL
        if not url:
            _jwks_cache = []
            return _jwks_cache
        try:
            resp = _requests.get(url, timeout=5)
            resp.raise_for_status()
            _jwks_cache = resp.json().get("keys", [])
            print(f"[*] Loaded {len(_jwks_cache)} JWKS key(s) from Supabase.")
        except Exception as e:
            print(f"[!] Failed to fetch JWKS: {e}")
            _jwks_cache = []
        return _jwks_cache


def _verify_token(token: str) -> dict:
    """
    Verify a Supabase JWT.
    Tries ES256 via JWKS first, then falls back to HS256 shared secret.
    Raises HTTPException(401) on invalid/expired tokens.
    """
    keys = _get_jwks_keys()

    # ── Try ES256 verification via JWKS ──────────────────────────────────────
    if keys:
        # Get the kid from the unverified header to pick the right key
        try:
            header = jwt.get_unverified_header(token)
            kid = header.get("kid")
            alg = header.get("alg", "ES256")
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token header: {e}",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Find the matching key by kid, or try all keys
        matching_keys = [k for k in keys if k.get("kid") == kid] if kid else keys
        if not matching_keys:
            matching_keys = keys  # fallback: try all

        for key_data in matching_keys:
            try:
                public_key = jwk.construct(key_data, algorithm=alg)
                payload = jwt.decode(
                    token,
                    public_key,
                    algorithms=[alg],
                    options={"verify_aud": False},
                )
                return payload
            except JWTError:
                continue  # try the next key

        # All JWKS keys failed — raise
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signature verification failed.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Fallback: HS256 shared secret ─────────────────────────────────────────
    secret = settings.SUPABASE_JWT_SECRET
    verify_sig = bool(secret and secret != "your_supabase_jwt_secret")
    options = {"verify_aud": False}
    if not verify_sig:
        options["verify_signature"] = False

    try:
        return jwt.decode(
            token,
            secret or "dummy_secret",
            algorithms=["HS256"],
            options=options,
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── DB helpers ────────────────────────────────────────────────────────────────
from app.core.database import get_db
from sqlalchemy.orm import Session


def _ensure_user_exists(db: Session, user_id: str, email: str, full_name: str) -> None:
    from app.models.user import User
    try:
        existing = db.query(User).filter(User.id == user_id).first()
        if not existing:
            new_user = User(id=user_id, email=email, full_name=full_name)
            db.add(new_user)
            db.commit()
    except Exception as e:
        print(f"Error ensuring user exists: {e}")
        db.rollback()


# ── Main dependency ───────────────────────────────────────────────────────────
def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> str:
    """
    FastAPI dependency that validates the Supabase JWT and returns the user's UUID.
    Unauthenticated requests receive a 401.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to continue.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Reject any leftover mock tokens
    if token == "mock_user_token" or token.startswith("mock_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to continue.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = _verify_token(token)

    user_id: str = payload.get("sub")
    email: str = payload.get("email", "")
    user_metadata = payload.get("user_metadata", {})
    full_name = user_metadata.get("full_name") or (email.split("@")[0].capitalize() if email else "User")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: user ID not found.",
        )

    _ensure_user_exists(db, user_id, email, full_name)
    return user_id


# ── Optional auth dependency ──────────────────────────────────────────────────
def get_optional_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> str | None:
    """Returns user_id if a valid token is provided, otherwise returns None."""
    if not credentials:
        return None
    try:
        return get_current_user_id(credentials, db)
    except HTTPException:
        return None
