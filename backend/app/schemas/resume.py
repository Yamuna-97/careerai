"""
app/schemas/resume.py
──────────────────────
Pydantic schemas for Resume API requests and responses.
Includes the nested section schemas and completion calculation.
"""

from datetime import datetime
from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional

from app.schemas.education import EducationResponse
from app.schemas.experience import ExperienceResponse
from app.schemas.project import ProjectResponse
from app.schemas.skill import SkillResponse
from app.schemas.certification import CertificationResponse
from app.schemas.achievement import AchievementResponse


# ── Resume Create / Update ────────────────────────────────────────────────────

class ResumeCreate(BaseModel):
    """Data needed to create a new resume."""
    title: str = "My Resume"
    template: str = "modern"
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    profile_image: Optional[str] = None
    summary: Optional[str] = None


class ResumeUpdate(BaseModel):
    """All fields are optional for partial updates (PATCH-style)."""
    title: Optional[str] = None
    template: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    profile_image: Optional[str] = None
    summary: Optional[str] = None


# ── Resume Responses ──────────────────────────────────────────────────────────

class ResumeSummaryResponse(BaseModel):
    """Brief resume info — used in list views."""
    id: str
    user_id: str
    title: str
    template: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ResumeResponse(ResumeSummaryResponse):
    """Full resume detail including all sections."""
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    profile_image: Optional[str] = None
    summary: Optional[str] = None

    # Nested sections — returned with full resume
    education: list[EducationResponse] = []
    experience: list[ExperienceResponse] = []
    projects: list[ProjectResponse] = []
    skills: list[SkillResponse] = []
    certifications: list[CertificationResponse] = []
    achievements: list[AchievementResponse] = []

    model_config = {"from_attributes": True}


# ── Completion Stats ──────────────────────────────────────────────────────────

class ResumeCompletionResponse(BaseModel):
    """Resume completion percentage and section breakdown."""
    resume_id: str
    completion_percentage: int
    completed_sections: int
    total_sections: int
    sections: dict[str, bool]   # e.g. {"personal_info": True, "summary": False, ...}


class ResumeDashboardStats(BaseModel):
    """Stats shown on the dashboard for a resume."""
    resume_id: str
    title: str
    template: str
    completion_percentage: int
    ats_score: int
    updated_at: datetime
