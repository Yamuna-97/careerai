"""
app/api/router.py
──────────────────
Main API router — combines all route modules under /api/v1/.
Add new route modules here as the app grows.
"""

from fastapi import APIRouter
from app.api.routes import (
    auth,
    users,
    resumes,
    sections,
    templates,
    ai,
    ats,
    export,
    interviews,
    resume_ai,
    latex,
    jobs,
)

api_router = APIRouter()

# Include each route module with its prefix and Swagger tag
api_router.include_router(auth.router,       prefix="/auth",       tags=["Authentication"])
api_router.include_router(users.router,      prefix="/users",      tags=["Users"])
api_router.include_router(resumes.router,    prefix="/resumes",    tags=["Resumes"])
api_router.include_router(sections.router,   prefix="/resumes",    tags=["Resume Sections"])
api_router.include_router(templates.router,  prefix="/templates",  tags=["Templates"])
api_router.include_router(ai.router,         prefix="/ai",         tags=["AI"])
api_router.include_router(ats.router,        prefix="/ats",        tags=["ATS"])
api_router.include_router(export.router,     prefix="/resumes",    tags=["Export"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["Interviews"])
api_router.include_router(resume_ai.router,  prefix="/resume/ai",  tags=["Resume AI Studio"])
api_router.include_router(latex.router,      prefix="/latex",      tags=["LaTeX Resume Editor"])
api_router.include_router(jobs.router,       prefix="/jobs",       tags=["Job Search Engine"])
