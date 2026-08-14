"""
app/main.py
───────────
FastAPI application entry point.

Starts the server, configures CORS, registers all API routes,
and provides health check endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import check_db_connection
from app.api.router import api_router


# ── Application Lifespan ──────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs startup and shutdown logic."""
    # Startup
    print(f"[*] Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"   Debug mode: {settings.DEBUG}")
    print(f"   Docs: http://localhost:8000/docs")
    
    # Auto-create tables for local testing
    try:
        from app.core.database import Base, engine
        import app.models
        Base.metadata.create_all(bind=engine)
        print("[*] Database tables successfully verified/created.")
    except Exception as e:
        print(f"[!] Error auto-creating database tables: {e}")
        
    yield
    # Shutdown
    print("[*] Shutting down CareerAI backend.")


# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Career Development Platform — Resume Builder API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ── CORS Middleware ───────────────────────────────────────────────────────────
# Allows the React frontend (on localhost:5173) to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register API Routes ───────────────────────────────────────────────────────
# All routes are prefixed with /api/v1
app.include_router(api_router, prefix="/api/v1")


# ── Health Check Endpoints ────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Basic health check")
def health_check():
    """Returns 200 if the API server is running."""
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.get("/health/db", tags=["Health"], summary="Database health check")
def db_health_check():
    """Returns database connection status."""
    db_ok = check_db_connection()
    return {
        "status": "healthy" if db_ok else "unhealthy",
        "database": "connected" if db_ok else "disconnected",
    }


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"], include_in_schema=False)
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
        "health": "/health",
    }
