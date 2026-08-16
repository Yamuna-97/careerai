"""
app/schemas/jobs.py
───────────────────
Pydantic schemas for the Intelligent Job Search feature.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


# ── JobSearchProfile Schemas ──────────────────────────────────────────────────

class JobSearchProfileBase(BaseModel):
    target_roles: List[str] = []
    skills: List[str] = []
    keywords: List[str] = []
    experience_level: str = "any"  # "entry" | "junior" | "mid" | "senior" | "any"
    current_title: Optional[str] = ""
    education_level: Optional[str] = ""
    locations: List[str] = []
    work_modes: List[str] = []  # ["remote", "hybrid", "onsite"]
    employment_types: List[str] = []  # ["full_time", "internship"]
    country_code: Optional[str] = "in"
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = "INR"


class JobSearchProfileCreate(JobSearchProfileBase):
    pass


class JobSearchProfileUpdate(JobSearchProfileBase):
    pass


class JobSearchProfileResponse(JobSearchProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── SavedJob Schemas ──────────────────────────────────────────────────────────

class SavedJobBase(BaseModel):
    external_job_id: str
    source: str = "jsearch"
    title: str
    company: Optional[str] = ""
    location: Optional[str] = ""
    description: Optional[str] = ""
    url: Optional[str] = ""
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_display: Optional[str] = ""
    employment_type: Optional[str] = ""
    work_mode: Optional[str] = ""
    category: Optional[str] = ""
    posted_date: Optional[str] = ""
    match_score: Optional[float] = 0.0
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    match_reasons: List[str] = []


class SavedJobCreate(SavedJobBase):
    pass


class SavedJobResponse(SavedJobBase):
    id: str
    user_id: str
    profile_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── JobApplication Schemas ───────────────────────────────────────────────────

class JobApplicationCreate(BaseModel):
    saved_job_id: str
    status: Optional[str] = "saved"  # saved | applied | interview | offer | rejected
    notes: Optional[str] = ""
    applied_at: Optional[datetime] = None


class JobApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None


class JobApplicationResponse(BaseModel):
    id: str
    user_id: str
    saved_job_id: str
    status: str
    notes: str
    applied_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    saved_job: Optional[SavedJobResponse] = None

    model_config = {"from_attributes": True}


# ── JobSearchHistory Schemas ─────────────────────────────────────────────────

class JobSearchHistoryResponse(BaseModel):
    id: str
    user_id: str
    query: str
    location: str
    filters: Dict[str, Any] = {}
    results_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── External Job Response Schemas ────────────────────────────────────────────

class JobSearchResponse(BaseModel):
    id: str
    source: str
    external_id: str
    title: str
    company: str
    location: str
    work_mode: str
    employment_type: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_display: str
    category: str
    description: str
    url: str
    posted_date: str
    match_score: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    match_reasons: List[str] = []
    is_saved: bool = False
    application_status: Optional[str] = None  # status if application exists

    model_config = {"from_attributes": True}


class JobSearchProfileExtractRequest(BaseModel):
    resume_id: str
