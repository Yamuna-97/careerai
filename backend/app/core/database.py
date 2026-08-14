"""
app/core/database.py
─────────────────────
SQLAlchemy engine and session factory.
Uses the Supabase PostgreSQL connection string from config.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


# ── SQLAlchemy Engine ─────────────────────────────────────────────────────────
# pool_pre_ping=True — automatically reconnects dropped connections
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG,          # log SQL queries only in debug mode
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
