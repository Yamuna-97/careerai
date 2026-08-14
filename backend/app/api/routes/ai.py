"""
app/api/routes/ai.py
─────────────────────
AI feature API endpoints.
Returns a clear message when no AI provider is configured.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.core.security import get_current_user_id
from app.services import ai_service

router = APIRouter()


# ── Request Bodies ─────────────────────────────────────────────────────────────

class ImproveSummaryRequest(BaseModel):
    current_summary: str
    job_title: Optional[str] = ""


class ImproveExperienceRequest(BaseModel):
    description: str
    company: Optional[str] = ""
    position: Optional[str] = ""


class GenerateProjectRequest(BaseModel):
    project_name: str
    technologies: Optional[str] = ""


class GenerateSkillsRequest(BaseModel):
    job_title: str
    existing_skills: Optional[list[str]] = []


class AnalyzeResumeRequest(BaseModel):
    resume_id: str


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/improve-summary", summary="AI: Improve professional summary")
def improve_summary(
    body: ImproveSummaryRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Use AI to improve a professional summary."""
    result = ai_service.improve_summary(body.current_summary, body.job_title)
    return {"success": result.success, "result": result.result, "message": result.message, "provider": result.provider}


@router.post("/improve-experience", summary="AI: Improve experience description")
def improve_experience(
    body: ImproveExperienceRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Use AI to improve a work experience description with achievement-focused bullet points."""
    result = ai_service.improve_experience(body.description, body.company, body.position)
    return {"success": result.success, "result": result.result, "message": result.message, "provider": result.provider}


@router.post("/generate-project-description", summary="AI: Generate project description")
def generate_project_description(
    body: GenerateProjectRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Generate a professional project description from project name and technologies."""
    result = ai_service.generate_project_description(body.project_name, body.technologies)
    return {"success": result.success, "result": result.result, "message": result.message, "provider": result.provider}


@router.post("/generate-skills", summary="AI: Suggest relevant skills")
def generate_skills(
    body: GenerateSkillsRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Suggest skills to add for a given job title."""
    result = ai_service.generate_skills(body.job_title, body.existing_skills)
    return {"success": result.success, "result": result.result, "message": result.message, "provider": result.provider}


@router.post("/analyze-resume", summary="AI: Full resume analysis")
def analyze_resume(
    body: AnalyzeResumeRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Get comprehensive AI analysis and personalized recommendations for a resume."""
    result = ai_service.analyze_resume({"resume_id": body.resume_id})
    return {"success": result.success, "result": result.result, "message": result.message, "provider": result.provider}
