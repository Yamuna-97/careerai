"""
app/api/routes/resumes.py
──────────────────────────
Resume CRUD endpoints.
All routes require authentication — users can only access their own resumes.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.schemas.resume import (
    ResumeCreate, ResumeUpdate,
    ResumeResponse, ResumeSummaryResponse,
    ResumeCompletionResponse, ResumeDashboardStats,
)
from app.services import resume_service, ats_service

router = APIRouter()


@router.post(
    "",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new resume",
)
def create_resume(
    data: ResumeCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """Create a new resume for the authenticated user."""
    return resume_service.create_resume(db, current_user_id, data)


@router.get(
    "",
    response_model=List[ResumeSummaryResponse],
    summary="Get all my resumes",
)
def get_all_resumes(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """Return a list of all resumes belonging to the authenticated user."""
    return resume_service.get_all_resumes(db, current_user_id)


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
    summary="Get a specific resume",
)
def get_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """Return full resume details including all sections."""
    return resume_service.get_resume_by_id(db, resume_id, current_user_id)


@router.put(
    "/{resume_id}",
    response_model=ResumeResponse,
    summary="Update a resume",
)
def update_resume(
    resume_id: str,
    data: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """Update resume fields. Only the fields you provide will be updated."""
    return resume_service.update_resume(db, resume_id, current_user_id, data)


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a resume",
)
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """Permanently delete a resume and all its sections."""
    resume_service.delete_resume(db, resume_id, current_user_id)


@router.post(
    "/{resume_id}/duplicate",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Duplicate a resume",
)
def duplicate_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """Create a copy of an existing resume with all its sections."""
    return resume_service.duplicate_resume(db, resume_id, current_user_id)


@router.get(
    "/{resume_id}/completion",
    response_model=ResumeCompletionResponse,
    summary="Get resume completion percentage",
)
def get_resume_completion(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """Calculate how complete a resume is based on filled sections."""
    resume = resume_service.get_resume_by_id(db, resume_id, current_user_id)
    return resume_service.calculate_completion(resume)


@router.get(
    "/{resume_id}/stats",
    response_model=ResumeDashboardStats,
    summary="Get dashboard stats for a resume",
)
def get_resume_stats(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Return dashboard stats: completion %, ATS score, template, last updated.
    Used by the frontend dashboard cards.
    """
    resume = resume_service.get_resume_by_id(db, resume_id, current_user_id)
    completion = resume_service.calculate_completion(resume)
    ats_result = ats_service.score_resume(resume)

    return ResumeDashboardStats(
        resume_id=resume.id,
        title=resume.title,
        template=resume.template,
        completion_percentage=completion.completion_percentage,
        ats_score=ats_result.score,
        updated_at=resume.updated_at,
    )
