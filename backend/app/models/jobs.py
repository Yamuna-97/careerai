"""
app/models/jobs.py
───────────────────
SQLAlchemy models for the Intelligent Job Search feature.
- JobSearchProfile  : user's career preferences & search settings
- SavedJob          : bookmarked jobs from external sources
- JobApplication    : application status tracker per saved job
- JobSearchHistory  : log of past search queries for analytics
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Float, Integer, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class JobSearchProfile(Base):
    """
    Stores the user's persistent job-search preferences.
    Created once, can be updated at any time.
    """
    __tablename__ = "job_search_profiles"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False, unique=True)

    # Career targeting
    target_roles = Column(JSON, default=list)        # ["ML Engineer", "AI Engineer"]
    skills = Column(JSON, default=list)              # ["Python", "PyTorch"]
    keywords = Column(JSON, default=list)            # ["deep learning", "nlp"]
    experience_level = Column(String, default="any") # "entry" | "junior" | "mid" | "senior" | "any"
    current_title = Column(String, default="")
    education_level = Column(String, default="")

    # Location & work preferences
    locations = Column(JSON, default=list)           # ["Chennai", "Bangalore", "Remote"]
    work_modes = Column(JSON, default=list)          # ["remote", "hybrid", "onsite"]
    employment_types = Column(JSON, default=list)    # ["full_time", "internship"]
    country_code = Column(String, default="in")      # adzuna country: "in", "gb", "us"

    # Salary
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String, default="INR")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    saved_jobs = relationship("SavedJob", back_populates="profile", cascade="all, delete-orphan")


class SavedJob(Base):
    """
    A job the user has bookmarked from Adzuna search results.
    Preserves the original external URL for direct applications.
    """
    __tablename__ = "saved_jobs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    profile_id = Column(String, nullable=True)

    # External job data (normalized from Adzuna)
    external_job_id = Column(String, index=True)     # Adzuna's redirect_url hash
    source = Column(String, default="adzuna")
    title = Column(String, nullable=False)
    company = Column(String, default="")
    location = Column(String, default="")
    description = Column(Text, default="")
    url = Column(Text, default="")                   # Original application URL
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_display = Column(String, default="")      # e.g. "₹8L – ₹12L"
    employment_type = Column(String, default="")
    work_mode = Column(String, default="")
    category = Column(String, default="")
    posted_date = Column(String, default="")

    # CareerAI match data
    match_score = Column(Float, default=0.0)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    match_reasons = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("JobSearchProfile", back_populates="saved_jobs", foreign_keys=[profile_id],
                           primaryjoin="SavedJob.profile_id == JobSearchProfile.id")
    application = relationship("JobApplication", back_populates="saved_job",
                               uselist=False, cascade="all, delete-orphan")


class JobApplication(Base):
    """
    Tracks the application lifecycle for a saved job.
    Status flows: saved → applied → interview → offer | rejected
    """
    __tablename__ = "job_applications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    saved_job_id = Column(String, nullable=False, index=True)

    status = Column(String, default="saved")  # saved|applied|interview|offer|rejected
    notes = Column(Text, default="")
    applied_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    saved_job = relationship("SavedJob", back_populates="application",
                             foreign_keys=[saved_job_id],
                             primaryjoin="JobApplication.saved_job_id == SavedJob.id")


class JobSearchHistory(Base):
    """
    Logs each Adzuna search for analytics and "Search Again" workflows.
    """
    __tablename__ = "job_search_history"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)

    query = Column(String, default="")
    location = Column(String, default="")
    filters = Column(JSON, default=dict)       # Snapshot of search parameters
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
