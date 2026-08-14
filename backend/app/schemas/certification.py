"""app/schemas/certification.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CertificationCreate(BaseModel):
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None
    description: Optional[str] = None


class CertificationUpdate(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None
    description: Optional[str] = None


class CertificationResponse(CertificationCreate):
    id: str
    resume_id: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
