"""
app/api/routes/sections.py
───────────────────────────
CRUD routes for all resume section types:
  - Education
  - Experience
  - Projects
  - Skills
  - Certifications
  - Achievements

All routes verify the authenticated user owns the resume before touching sections.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services.resume_service import get_resume_by_id

from app.models.education import Education
from app.models.experience import Experience
from app.models.project import Project
from app.models.skill import Skill
from app.models.certification import Certification
from app.models.achievement import Achievement

from app.schemas.education import EducationCreate, EducationUpdate, EducationResponse
from app.schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.skill import SkillCreate, SkillUpdate, SkillResponse
from app.schemas.certification import CertificationCreate, CertificationUpdate, CertificationResponse
from app.schemas.achievement import AchievementCreate, AchievementUpdate, AchievementResponse

router = APIRouter()


# ── Helper ────────────────────────────────────────────────────────────────────

def _get_or_404(db: Session, model, item_id: str, resume_id: str):
    """Get a section item by ID and verify it belongs to the given resume."""
    item = db.query(model).filter(model.id == item_id, model.resume_id == resume_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{model.__name__} not found.")
    return item


# ─────────────────────────────────────────────────────────────────────────────
# EDUCATION
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{resume_id}/education", response_model=List[EducationResponse], summary="List education entries")
def list_education(resume_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    return db.query(Education).filter(Education.resume_id == resume_id).order_by(Education.order_index).all()


@router.post("/{resume_id}/education", response_model=EducationResponse, status_code=201, summary="Add education")
def add_education(resume_id: str, data: EducationCreate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = Education(id=str(uuid.uuid4()), resume_id=resume_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{resume_id}/education/{item_id}", response_model=EducationResponse, summary="Update education")
def update_education(resume_id: str, item_id: str, data: EducationUpdate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Education, item_id, resume_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{resume_id}/education/{item_id}", status_code=204, summary="Delete education")
def delete_education(resume_id: str, item_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Education, item_id, resume_id)
    db.delete(item)
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# EXPERIENCE
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{resume_id}/experience", response_model=List[ExperienceResponse], summary="List experience")
def list_experience(resume_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    return db.query(Experience).filter(Experience.resume_id == resume_id).order_by(Experience.order_index).all()


@router.post("/{resume_id}/experience", response_model=ExperienceResponse, status_code=201, summary="Add experience")
def add_experience(resume_id: str, data: ExperienceCreate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = Experience(id=str(uuid.uuid4()), resume_id=resume_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{resume_id}/experience/{item_id}", response_model=ExperienceResponse, summary="Update experience")
def update_experience(resume_id: str, item_id: str, data: ExperienceUpdate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Experience, item_id, resume_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{resume_id}/experience/{item_id}", status_code=204, summary="Delete experience")
def delete_experience(resume_id: str, item_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Experience, item_id, resume_id)
    db.delete(item)
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# PROJECTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{resume_id}/projects", response_model=List[ProjectResponse], summary="List projects")
def list_projects(resume_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    return db.query(Project).filter(Project.resume_id == resume_id).order_by(Project.order_index).all()


@router.post("/{resume_id}/projects", response_model=ProjectResponse, status_code=201, summary="Add project")
def add_project(resume_id: str, data: ProjectCreate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = Project(id=str(uuid.uuid4()), resume_id=resume_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{resume_id}/projects/{item_id}", response_model=ProjectResponse, summary="Update project")
def update_project(resume_id: str, item_id: str, data: ProjectUpdate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Project, item_id, resume_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{resume_id}/projects/{item_id}", status_code=204, summary="Delete project")
def delete_project(resume_id: str, item_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Project, item_id, resume_id)
    db.delete(item)
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# SKILLS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{resume_id}/skills", response_model=List[SkillResponse], summary="List skills")
def list_skills(resume_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    return db.query(Skill).filter(Skill.resume_id == resume_id).all()


@router.post("/{resume_id}/skills", response_model=SkillResponse, status_code=201, summary="Add skill")
def add_skill(resume_id: str, data: SkillCreate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = Skill(id=str(uuid.uuid4()), resume_id=resume_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{resume_id}/skills/{item_id}", response_model=SkillResponse, summary="Update skill")
def update_skill(resume_id: str, item_id: str, data: SkillUpdate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Skill, item_id, resume_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{resume_id}/skills/{item_id}", status_code=204, summary="Delete skill")
def delete_skill(resume_id: str, item_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Skill, item_id, resume_id)
    db.delete(item)
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# CERTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{resume_id}/certifications", response_model=List[CertificationResponse], summary="List certifications")
def list_certifications(resume_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    return db.query(Certification).filter(Certification.resume_id == resume_id).all()


@router.post("/{resume_id}/certifications", response_model=CertificationResponse, status_code=201, summary="Add certification")
def add_certification(resume_id: str, data: CertificationCreate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = Certification(id=str(uuid.uuid4()), resume_id=resume_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{resume_id}/certifications/{item_id}", response_model=CertificationResponse, summary="Update certification")
def update_certification(resume_id: str, item_id: str, data: CertificationUpdate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Certification, item_id, resume_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{resume_id}/certifications/{item_id}", status_code=204, summary="Delete certification")
def delete_certification(resume_id: str, item_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Certification, item_id, resume_id)
    db.delete(item)
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# ACHIEVEMENTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{resume_id}/achievements", response_model=List[AchievementResponse], summary="List achievements")
def list_achievements(resume_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    return db.query(Achievement).filter(Achievement.resume_id == resume_id).all()


@router.post("/{resume_id}/achievements", response_model=AchievementResponse, status_code=201, summary="Add achievement")
def add_achievement(resume_id: str, data: AchievementCreate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = Achievement(id=str(uuid.uuid4()), resume_id=resume_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{resume_id}/achievements/{item_id}", response_model=AchievementResponse, summary="Update achievement")
def update_achievement(resume_id: str, item_id: str, data: AchievementUpdate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Achievement, item_id, resume_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{resume_id}/achievements/{item_id}", status_code=204, summary="Delete achievement")
def delete_achievement(resume_id: str, item_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    get_resume_by_id(db, resume_id, current_user_id)
    item = _get_or_404(db, Achievement, item_id, resume_id)
    db.delete(item)
    db.commit()
