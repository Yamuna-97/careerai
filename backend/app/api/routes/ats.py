"""
app/api/routes/ats.py
──────────────────────
ATS scoring endpoint.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services import resume_service, ats_service

router = APIRouter()


class ATSScoreResponse(BaseModel):
    resume_id: str
    score: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]


@router.get(
    "/score/{resume_id}",
    response_model=ATSScoreResponse,
    summary="Get ATS score for a resume",
)
def get_ats_score(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Run ATS analysis on a resume and return a score (0-100)
    with strengths, weaknesses, and improvement suggestions.
    """
    resume = resume_service.get_resume_by_id(db, resume_id, current_user_id)
    result = ats_service.score_resume(resume)
    return ATSScoreResponse(
        resume_id=resume_id,
        score=result.score,
        strengths=result.strengths,
        weaknesses=result.weaknesses,
        suggestions=result.suggestions,
    )
