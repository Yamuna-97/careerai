"""
app/services/resume_service.py
───────────────────────────────
Business logic for resume operations.
Keeps route handlers thin — all database logic lives here.
"""

import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.resume import Resume
from app.models.education import Education
from app.models.experience import Experience
from app.models.project import Project
from app.models.skill import Skill
from app.models.certification import Certification
from app.models.achievement import Achievement
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeCompletionResponse


# ── Resume CRUD ───────────────────────────────────────────────────────────────

def create_resume(db: Session, user_id: str, data: ResumeCreate) -> Resume:
    """Create a new resume for the authenticated user."""
    resume = Resume(
        id=str(uuid.uuid4()),
        user_id=user_id,
        **data.model_dump(),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


def get_resume_by_id(db: Session, resume_id: str, user_id: str) -> Resume:
    """
    Fetch a resume by ID.
    Raises 404 if not found, 403 if it belongs to another user.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    if resume.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return resume


def get_all_resumes(db: Session, user_id: str) -> list[Resume]:
    """Return all resumes belonging to the authenticated user."""
    return (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.updated_at.desc())
        .all()
    )


def update_resume(db: Session, resume_id: str, user_id: str, data: ResumeUpdate) -> Resume:
    """Update resume fields. Only updates fields that were actually provided."""
    resume = get_resume_by_id(db, resume_id, user_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resume, field, value)
    db.commit()
    db.refresh(resume)
    return resume


def delete_resume(db: Session, resume_id: str, user_id: str) -> None:
    """Delete a resume (cascades to all sections)."""
    resume = get_resume_by_id(db, resume_id, user_id)
    db.delete(resume)
    db.commit()


def duplicate_resume(db: Session, resume_id: str, user_id: str) -> Resume:
    """
    Create a copy of an existing resume including all its sections.
    The copy title gets ' (Copy)' appended.
    """
    original = get_resume_by_id(db, resume_id, user_id)
    new_id = str(uuid.uuid4())

    # Copy the resume
    new_resume = Resume(
        id=new_id,
        user_id=user_id,
        title=f"{original.title} (Copy)",
        template=original.template,
        full_name=original.full_name,
        email=original.email,
        phone=original.phone,
        location=original.location,
        linkedin=original.linkedin,
        github=original.github,
        portfolio=original.portfolio,
        summary=original.summary,
    )
    db.add(new_resume)

    # Copy each section
    for edu in original.education:
        db.add(Education(
            id=str(uuid.uuid4()), resume_id=new_id,
            institution=edu.institution, degree=edu.degree,
            field_of_study=edu.field_of_study, start_date=edu.start_date,
            end_date=edu.end_date, grade=edu.grade,
            description=edu.description, order_index=edu.order_index,
        ))

    for exp in original.experience:
        db.add(Experience(
            id=str(uuid.uuid4()), resume_id=new_id,
            company=exp.company, position=exp.position,
            location=exp.location, start_date=exp.start_date,
            end_date=exp.end_date, currently_working=exp.currently_working,
            description=exp.description, order_index=exp.order_index,
        ))

    for proj in original.projects:
        db.add(Project(
            id=str(uuid.uuid4()), resume_id=new_id,
            name=proj.name, description=proj.description,
            technologies=proj.technologies, github_url=proj.github_url,
            live_url=proj.live_url, start_date=proj.start_date,
            end_date=proj.end_date, order_index=proj.order_index,
        ))

    for skill in original.skills:
        db.add(Skill(
            id=str(uuid.uuid4()), resume_id=new_id,
            name=skill.name, category=skill.category,
        ))

    for cert in original.certifications:
        db.add(Certification(
            id=str(uuid.uuid4()), resume_id=new_id,
            name=cert.name, issuer=cert.issuer,
            issue_date=cert.issue_date, credential_url=cert.credential_url,
            description=cert.description,
        ))

    for ach in original.achievements:
        db.add(Achievement(
            id=str(uuid.uuid4()), resume_id=new_id,
            title=ach.title, description=ach.description,
            date=ach.date, organization=ach.organization,
        ))

    db.commit()
    db.refresh(new_resume)
    return new_resume


# ── Resume Completion ─────────────────────────────────────────────────────────

def calculate_completion(resume: Resume) -> ResumeCompletionResponse:
    """
    Dynamically calculate how complete a resume is.
    Each section is either complete (True) or incomplete (False).
    """
    sections = {
        "personal_info": bool(resume.full_name and resume.email and resume.phone),
        "summary": bool(resume.summary and len(resume.summary) > 20),
        "education": len(resume.education) > 0,
        "experience": len(resume.experience) > 0,
        "projects": len(resume.projects) > 0,
        "skills": len(resume.skills) > 0,
        "certifications": len(resume.certifications) > 0,
        "achievements": len(resume.achievements) > 0,
    }

    total = len(sections)
    completed = sum(1 for v in sections.values() if v)
    percentage = round((completed / total) * 100)

    return ResumeCompletionResponse(
        resume_id=resume.id,
        completion_percentage=percentage,
        completed_sections=completed,
        total_sections=total,
        sections=sections,
    )
