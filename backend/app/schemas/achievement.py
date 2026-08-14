"""app/schemas/achievement.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AchievementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[str] = None
    organization: Optional[str] = None


class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    organization: Optional[str] = None


class AchievementResponse(AchievementCreate):
    id: str
    resume_id: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
