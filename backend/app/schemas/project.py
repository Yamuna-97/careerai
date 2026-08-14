"""app/schemas/project.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: Optional[str] = None   # comma-separated: "Python, FastAPI, React"
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    order_index: int = 0


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    order_index: Optional[int] = None


class ProjectResponse(ProjectCreate):
    id: str
    resume_id: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
