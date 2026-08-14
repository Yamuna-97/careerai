"""
app/core/database.py
─────────────────────
SQLAlchemy engine and session factory.
Uses the Supabase PostgreSQL connection string from config.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


# ── Resolve Database URL with Placeholder Fallback ──────────────────────────
db_url = settings.DATABASE_URL
if "your_project_ref" in db_url or not db_url:
    db_url = "sqlite:///./careerai.db"


# ── SQLAlchemy Engine ─────────────────────────────────────────────────────────
if db_url.startswith("sqlite"):
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG,
    )
else:
    # pool_pre_ping=True — automatically reconnects dropped connections
    engine = create_engine(
        db_url,
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
