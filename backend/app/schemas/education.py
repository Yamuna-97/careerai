"""app/schemas/education.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class EducationCreate(BaseModel):
    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None
    order_index: int = 0


class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


class EducationResponse(EducationCreate):
    id: str
    resume_id: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
