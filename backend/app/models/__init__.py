"""
app/models/__init__.py
──────────────────────
Imports all models so Alembic can discover them when generating migrations.
Every model class must be imported here.
"""

from app.models.user import User
from app.models.resume import Resume
from app.models.education import Education
from app.models.experience import Experience
from app.models.project import Project
from app.models.skill import Skill
from app.models.certification import Certification
from app.models.achievement import Achievement
from app.models.interview import InterviewSession, InterviewQuestion, InterviewAnswer
from app.models.latex import LatexProject, LatexProjectFile
from app.models.jobs import JobSearchProfile, SavedJob, JobApplication, JobSearchHistory

__all__ = [
    "User",
    "Resume",
    "Education",
    "Experience",
    "Project",
    "Skill",
    "Certification",
    "Achievement",
    "InterviewSession",
    "InterviewQuestion",
    "InterviewAnswer",
    "LatexProject",
    "LatexProjectFile",
    "JobSearchProfile",
    "SavedJob",
    "JobApplication",
    "JobSearchHistory",
]
