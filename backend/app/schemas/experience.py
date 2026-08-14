"""app/schemas/experience.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ExperienceCreate(BaseModel):
    company: str
    position: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    currently_working: bool = False
    description: Optional[str] = None
    order_index: int = 0


class ExperienceUpdate(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    currently_working: Optional[bool] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


class ExperienceResponse(ExperienceCreate):
    id: str
    resume_id: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
