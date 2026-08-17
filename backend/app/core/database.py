"""
app/core/database.py
─────────────────────
SQLAlchemy engine and session factory.
Uses the Supabase PostgreSQL connection string from config.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


def _is_placeholder_url(url: str) -> bool:
    """Return True if the DATABASE_URL is still a template/placeholder."""
    placeholders = ["your_project_ref", "your_password", "REPLACE_WITH"]
    return not url or any(p in url for p in placeholders)


def _normalize_db_url(url: str) -> str:
    """
    Ensure the URL uses the correct psycopg v3 driver scheme.
    Also swap the IPv6-only direct Supabase host for the IPv4 pooler.
    """
    # Fix driver scheme: plain postgresql:// → postgresql+psycopg://
    if url.startswith("postgresql://") or url.startswith("postgres://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        url = url.replace("postgres://", "postgresql+psycopg://", 1)

    # Replace IPv6-only direct host with Tokyo IPv4 pooler
    # The direct host (db.<ref>.supabase.co) only has AAAA records on newer projects
    if "db.nprgkqwobzjogizbzciz.supabase.co" in url:
        url = url.replace(
            "db.nprgkqwobzjogizbzciz.supabase.co",
            "aws-0-ap-northeast-1.pooler.supabase.com"
        )
        # Direct connection uses plain 'postgres' user; pooler needs 'postgres.REF'
        url = url.replace(
            "postgresql+psycopg://postgres:",
            "postgresql+psycopg://postgres.nprgkqwobzjogizbzciz:"
        )
        # Ensure sslmode is set
        if "sslmode" not in url:
            url += "?sslmode=require"

    return url


def _scrub_password(url: str) -> str:
    """Remove the password from a connection URL for safe logging."""
    import re
    return re.sub(r'(://[^:]+:)[^@]+(@)', r'\1***\2', url)


# ── Resolve Database URL ─────────────────────────────────────────────────────
_raw_db_url = settings.DATABASE_URL
if _is_placeholder_url(_raw_db_url):
    print("[!] WARNING: DATABASE_URL is not configured. Please set DATABASE_URL in your backend .env file to your Supabase PostgreSQL connection URI.")
    db_url = ""
else:
    db_url = _normalize_db_url(_raw_db_url)
    try:
        from sqlalchemy import create_engine as temp_create_engine
        test_engine = temp_create_engine(db_url, connect_args={"connect_timeout": 5})
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        test_engine.dispose()
        print(f"[*] Connected to Supabase PostgreSQL: {_scrub_password(db_url)}")
    except Exception as e:
        safe_err = _scrub_password(str(e))
        print(f"[!] Supabase PostgreSQL connection warning: {safe_err}")


# ── SQLAlchemy Engine ─────────────────────────────────────────────────────────
if not db_url:
    # Use a null/mock engine URL scheme or empty configuration if DATABASE_URL is not set yet
    # to allow FastAPI to start up with clear configuration warnings
    engine = create_engine(
        "postgresql+psycopg://postgres:dummy@localhost:5432/postgres",
        echo=False,
    )
else:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        echo=False,
    )

# ── Session Factory ───────────────────────────────────────────────────────────
# autocommit=False means we manually commit transactions
# autoflush=False avoids unexpected flushes mid-request
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# ── Base Class for Models ─────────────────────────────────────────────────────
# All SQLAlchemy models inherit from this Base
class Base(DeclarativeBase):
    pass


# ── Dependency: get_db ────────────────────────────────────────────────────────
def get_db():
    """
    FastAPI dependency that provides a database session per request.
    The session is automatically closed after the request finishes.

    Usage in a route:
        def my_route(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Health Check ──────────────────────────────────────────────────────────────
def check_db_connection() -> bool:
    """
    Returns True if the database connection is healthy.
    Used by the /health endpoint.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
