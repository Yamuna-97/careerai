"""app/schemas/skill.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


SKILL_CATEGORIES = [
    "Programming Languages",
    "Frameworks",
    "Databases",
    "Machine Learning",
    "Tools",
    "Cloud",
    "Other",
]


class SkillCreate(BaseModel):
    name: str
    category: str = "Other"


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None


class SkillResponse(SkillCreate):
    id: str
    resume_id: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
