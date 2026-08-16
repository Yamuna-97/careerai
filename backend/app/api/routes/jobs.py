"""
app/api/routes/jobs.py
──────────────────────
FastAPI endpoints for Intelligent Job Search (JSearch integration).
Supports profile CRUD, JSearch proxying, job normalization, match scoring,
job saving/bookmarks, application status tracking, salary lookup, and Gemini analysis.
"""

import json
import uuid
from typing import Dict, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.jobs import JobSearchProfile, SavedJob, JobApplication, JobSearchHistory, TopFiveJobsCache
from app.models.resume import Resume
from app.services import jsearch_service, job_matching_service, resume_ai_service
from app.services.job_normalizer import normalize_job, deduplicate_jobs
from app.services.resume_service import get_all_resumes

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
bearer_scheme = HTTPBearer(auto_error=False)

def _get_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> str:
    if not credentials or not credentials.credentials:
        return "local_user"
    try:
        from app.core.security import _verify_token
        payload = _verify_token(credentials.credentials)
        return payload.get("sub") or "local_user"
    except BaseException:
        return "local_user"


def format_salary_display(job: dict) -> Optional[str]:
    min_sal = job.get("salary_min")
    max_sal = job.get("salary_max")
    currency = job.get("salary_currency")
    period = job.get("salary_period")
    
    if min_sal is None and max_sal is None:
        return None
        
    curr_symbol = currency or ""
    if currency == "INR":
        curr_symbol = "₹"
    elif currency == "USD":
        curr_symbol = "$"
    elif currency == "EUR":
        curr_symbol = "€"
    elif currency == "GBP":
        curr_symbol = "£"
        
    period_str = ""
    if period:
        period_str = f" / {period.lower()}"
        
    # LPA conversion for INR
    if currency == "INR" and period == "YEAR":
        min_lpa = round(min_sal / 100000, 1) if min_sal else None
        max_lpa = round(max_sal / 100000, 1) if max_sal else None
        
        # Clean .0 for integers
        if min_lpa is not None and min_lpa.is_integer():
            min_lpa = int(min_lpa)
        if max_lpa is not None and max_lpa.is_integer():
            max_lpa = int(max_lpa)
            
        if min_lpa is not None and max_lpa is not None:
            return f"₹{min_lpa}–{max_lpa} LPA"
        elif max_lpa is not None:
            return f"Up to ₹{max_lpa} LPA"
        elif min_lpa is not None:
            return f"₹{min_lpa} LPA"
            
    # Default formatting
    def format_num(val):
        if val is None: return ""
        if val >= 1000:
            return f"{int(val):,}"
        return str(int(val))
        
    if min_sal is not None and max_sal is not None:
        return f"{curr_symbol}{format_num(min_sal)}–{curr_symbol}{format_num(max_sal)}{period_str}"
    elif max_sal is not None:
        return f"Up to {curr_symbol}{format_num(max_sal)}{period_str}"
    elif min_sal is not None:
        return f"From {curr_symbol}{format_num(min_sal)}{period_str}"
    return None


router = APIRouter()




# ── Pydantic Request/Response Schemas ──────────────────────────────────────────

class ProfileCreateUpdate(BaseModel):
    target_roles: List[str] = []
    skills: Optional[List[str]] = []
    skill_tags: Optional[List[str]] = []
    keywords: Optional[List[str]] = []
    search_keywords: Optional[List[str]] = []
    experience_level: Optional[str] = "mid"
    locations: Optional[List[str]] = []
    preferred_locations: Optional[List[str]] = []
    work_modes: Optional[List[str]] = []
    employment_types: Optional[List[str]] = []
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None

    def get_skills(self) -> List[str]:
        return self.skill_tags or self.skills or []

    def get_keywords(self) -> List[str]:
        return self.search_keywords or self.keywords or []

    def get_locations(self) -> List[str]:
        return self.preferred_locations or self.locations or []


class JobSearchRequest(BaseModel):
    query: Optional[str] = None
    location: Optional[str] = None
    sort_by: Optional[str] = "best_match"   # "best_match" | "newest" | "salary_high" | "salary_low"
    work_mode: Optional[str] = None          # "remote" | "any"
    employment_type: Optional[str] = None    # "full_time" | "internship" | "contract" | "part_time"
    experience_level: Optional[str] = None
    date_posted: Optional[str] = "week"      # "all" | "today" | "3days" | "week" | "month"
    cursor: Optional[str] = None             # JSearch cursor for pagination
    num_pages: int = 1
    salary_min: Optional[float] = None


class SalaryRequest(BaseModel):
    job_title: str
    location: str
    location_type: Optional[str] = "CITY"
    years_of_experience: Optional[str] = None


class CompanySalaryRequest(BaseModel):
    company: str
    job_title: str
    location: Optional[str] = None
    location_type: Optional[str] = "CITY"
    years_of_experience: Optional[str] = None


class JobSaveRequest(BaseModel):
    id: str
    source: str
    title: str
    company: str
    location: str
    description: str
    url: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_display: Optional[str] = ""
    employment_type: Optional[str] = ""
    work_mode: Optional[str] = ""
    category: Optional[str] = ""
    posted_date: Optional[str] = ""
    match_score: Optional[float] = 0.0
    matched_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    match_reasons: Optional[List[str]] = []


class JobApplicationCreate(BaseModel):
    saved_job_id: str
    status: str  # saved | applied | interview | offer | rejected
    notes: Optional[str] = ""


class JobApplicationUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


# ── Profile Endpoints ─────────────────────────────────────────────────────────

@router.get("/profile", summary="Get or auto-generate user job search profile")
def get_profile(db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    profile = db.query(JobSearchProfile).filter(JobSearchProfile.user_id == current_user_id).first()

    if profile:
        return {
            "success": True,
            "profile_exists": True,
            "profile": {
                "id": profile.id,
                "target_roles": profile.target_roles,
                "skills": profile.skills,
                "keywords": profile.keywords,
                "experience_level": profile.experience_level,
                "locations": profile.locations,
                "work_modes": profile.work_modes,
                "employment_types": profile.employment_types,
                "salary_min": profile.salary_min,
                "salary_max": profile.salary_max,
                "country_code": profile.country_code,
                "current_title": profile.current_title
            }
        }

    # Check if user has a resume to seed profile creation
    resumes = get_all_resumes(db, current_user_id)
    if resumes:
        latest_resume = resumes[0]
        resume_data = {
            "personal": {
                "title": latest_resume.title,
                "location": latest_resume.location
            },
            "skills": [{"name": s.name} for s in latest_resume.skills if s.name],
            "education": [{"degree": e.degree, "fieldOfStudy": e.field_of_study} for e in latest_resume.education],
            "experience": [{"position": exp.position} for exp in latest_resume.experience]
        }

        extracted = resume_ai_service.extract_job_search_profile(resume_data)
        return {
            "success": True,
            "profile_exists": False,
            "has_resume": True,
            "extracted_draft": extracted
        }

    return {
        "success": True,
        "profile_exists": False,
        "has_resume": False
    }


@router.post("/profile", summary="Create user job search profile")
def create_profile(data: ProfileCreateUpdate, db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    existing = db.query(JobSearchProfile).filter(JobSearchProfile.user_id == current_user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update.")

    profile = JobSearchProfile(
        id=str(uuid.uuid4()),
        user_id=current_user_id,
        target_roles=data.target_roles,
        skills=data.skills,
        keywords=data.keywords,
        experience_level=data.experience_level,
        locations=data.locations,
        work_modes=data.work_modes,
        employment_types=data.employment_types,
        salary_min=data.salary_min,
        salary_max=data.salary_max
    )

    profile.country_code = jsearch_service._get_country_code(data.get_locations() or [])

    db.add(profile)
    db.commit()
    return {"success": True, "message": "Profile created successfully"}


@router.put("/profile", summary="Update user job search profile")
def update_profile(data: ProfileCreateUpdate, db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    profile = db.query(JobSearchProfile).filter(JobSearchProfile.user_id == current_user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    profile.target_roles = data.target_roles
    profile.skills = data.skills
    profile.keywords = data.keywords
    profile.experience_level = data.experience_level
    profile.locations = data.locations
    profile.work_modes = data.work_modes
    profile.employment_types = data.employment_types
    profile.salary_min = data.salary_min
    profile.salary_max = data.salary_max
    profile.country_code = jsearch_service._get_country_code(data.get_locations() or [])

    db.commit()
    return {"success": True, "message": "Profile updated successfully"}


@router.get("/top-five", summary="Get top 5 recommended jobs for the previous month")
def get_top_five_jobs(db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    # 1. Calculate previous completed calendar month
    now = datetime.utcnow()
    if now.month == 1:
        prev_month = 12
        prev_year = now.year - 1
    else:
        prev_month = now.month - 1
        prev_year = now.year

    months_names = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    period_str = f"{months_names[prev_month - 1]} {prev_year}"

    # 2. Check database/cache
    cache_entry = db.query(TopFiveJobsCache).filter(
        TopFiveJobsCache.user_id == current_user_id,
        TopFiveJobsCache.year == prev_year,
        TopFiveJobsCache.month == prev_month
    ).first()

    if cache_entry:
        print(f"[Top-Five] Cache hit for {current_user_id} - {period_str}")
        return {
            "success": True,
            "period": cache_entry.period,
            "year": cache_entry.year,
            "month": cache_entry.month,
            "total": len(cache_entry.jobs_json),
            "updated_at": cache_entry.updated_at.isoformat() if cache_entry.updated_at else datetime.utcnow().isoformat(),
            "jobs": cache_entry.jobs_json
        }

    print(f"[Top-Five] Cache miss for {current_user_id} - {period_str}. Fetching from JSearch...")

    # 3. Gather user profile/resume preferences
    profile = db.query(JobSearchProfile).filter(JobSearchProfile.user_id == current_user_id).first()
    resumes = get_all_resumes(db, current_user_id)

    queries = []
    locations = []
    employment_types = []
    work_from_home = False
    profile_dict = {}

    if profile:
        profile_dict = {
            "target_roles": profile.target_roles or [],
            "skills": profile.skills or [],
            "keywords": profile.keywords or [],
            "experience_level": profile.experience_level,
            "locations": profile.locations or [],
            "work_modes": profile.work_modes or [],
            "employment_types": profile.employment_types or [],
        }
        queries = jsearch_service.generate_search_queries(
            profile.target_roles, profile.skills, profile.keywords, profile.experience_level
        )
        locations = profile.locations or []
        employment_types = profile.employment_types or []
        work_from_home = "remote" in [m.lower() for m in (profile.work_modes or [])]
    elif resumes:
        latest_resume = resumes[0]
        resume_roles = [latest_resume.title] if latest_resume.title else []
        resume_skills = [s.name for s in latest_resume.skills if s.name]
        profile_dict = {
            "target_roles": resume_roles,
            "skills": resume_skills,
            "keywords": [],
            "experience_level": "any",
            "locations": [latest_resume.location] if latest_resume.location else [],
            "work_modes": [],
            "employment_types": [],
        }
        queries = jsearch_service.generate_search_queries(resume_roles, resume_skills, [], "any")
        locations = [latest_resume.location] if latest_resume.location else []
        work_from_home = False
    else:
        # Return success with empty results if no profile/resume exists
        return {
            "success": True,
            "period": period_str,
            "year": prev_year,
            "month": prev_month,
            "total": 0,
            "updated_at": datetime.utcnow().isoformat(),
            "jobs": []
        }

    # 4. Search jobs via JSearch
    raw_jobs, _, err_msg = jsearch_service.search_jobs(
        queries=queries,
        locations=locations,
        employment_types=employment_types,
        experience_level=profile.experience_level if profile else "any",
        date_posted="all", # Need 'all' to look back to previous calendar month
        work_from_home=work_from_home,
        num_pages=2
    )

    # Normalize
    normalized = [normalize_job(r) for r in raw_jobs if r]
    normalized = deduplicate_jobs(normalized)

    # Filter for previous completed month, or modify date if it is fallback data
    target_jobs = []
    for job in normalized:
        job_id = job.get("id", "")
        is_fallback = job_id.startswith("jsearch_fb_")
        
        if is_fallback:
            # Set fallback job date to target month so it passes filter
            job["posted_at"] = f"{prev_year}-{str(prev_month).zfill(2)}-15"
            job["posted_date"] = f"{prev_year}-{str(prev_month).zfill(2)}-15"

        posted_at = job.get("posted_at")
        if posted_at:
            try:
                parts = posted_at.split("-")
                if len(parts) == 3:
                    y = int(parts[0])
                    m = int(parts[1])
                    if y == prev_year and m == prev_month:
                        target_jobs.append(job)
            except Exception:
                pass

    # Score and check if saved
    scored_jobs = []
    for job in target_jobs:
        match_details = job_matching_service.match_job(profile_dict, job, use_ai=False)
        job.update(match_details)

        # Check if already saved
        saved = db.query(SavedJob).filter(
            SavedJob.user_id == current_user_id,
            SavedJob.external_job_id == job.get("id")
        ).first()
        job["is_saved"] = saved is not None
        job["saved_id"] = saved.id if saved else None

        # Format salary display
        sal_display = format_salary_display(job)
        if sal_display:
            job["salary_display"] = sal_display

        scored_jobs.append(job)

    # Sort and slice
    scored_jobs.sort(key=lambda x: x.get("match_score", 0), reverse=True)
    top_five = scored_jobs[:5]

    # Save to Cache
    if not err_msg:
        try:
            cache_id = str(uuid.uuid4())
            new_cache = TopFiveJobsCache(
                id=cache_id,
                user_id=current_user_id,
                year=prev_year,
                month=prev_month,
                period=period_str,
                jobs_json=top_five
            )
            db.add(new_cache)
            db.commit()
            print(f"[Top-Five] Stored cache for {current_user_id} - {period_str}")
        except Exception as e:
            db.rollback()
            print(f"[Top-Five] Error storing cache: {e}")

    return {
        "success": True,
        "period": period_str,
        "year": prev_year,
        "month": prev_month,
        "total": len(top_five),
        "updated_at": datetime.utcnow().isoformat(),
        "jobs": top_five,
        "error_message": err_msg
    }


# ── Search Endpoints ──────────────────────────────────────────────────────────

@router.post("/search", summary="Search real jobs using JSearch and calculate CareerAI matches")
def search_jobs(req: JobSearchRequest, db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    profile = db.query(JobSearchProfile).filter(JobSearchProfile.user_id == current_user_id).first()

    # 1. Gather queries, locations, employment types from profile or request
    queries = []
    locations = []
    employment_types = []
    exp_level = "any"
    profile_dict = {}

    if profile:
        profile_dict = {
            "target_roles": profile.target_roles or [],
            "skills": profile.skills or [],
            "keywords": profile.keywords or [],
            "experience_level": profile.experience_level,
            "locations": profile.locations or [],
            "work_modes": profile.work_modes or [],
            "employment_types": profile.employment_types or [],
        }

        if not req.query:
            queries = jsearch_service.generate_search_queries(
                profile.target_roles, profile.skills, profile.keywords, profile.experience_level
            )
        else:
            queries = [req.query]

        locations = [req.location] if req.location else (profile.locations or [])
        employment_types = [req.employment_type] if req.employment_type else (profile.employment_types or [])
        exp_level = req.experience_level or profile.experience_level or "any"
    else:
        if not req.query:
            raise HTTPException(status_code=400, detail="A search query or job profile is required.")
        queries = [req.query]
        locations = [req.location] if req.location else []
        employment_types = [req.employment_type] if req.employment_type else []

    # 2. Map work_mode → work_from_home flag
    work_from_home = False
    if req.work_mode and req.work_mode.lower() == "remote":
        work_from_home = True
    elif profile and profile.work_modes and "remote" in [m.lower() for m in profile.work_modes]:
        work_from_home = True

    # 3. Call JSearch
    raw_jobs, next_cursor, err_msg = jsearch_service.search_jobs(
        queries=queries,
        locations=locations,
        employment_types=employment_types,
        experience_level=exp_level,
        date_posted=req.date_posted or "week",
        work_from_home=work_from_home,
        cursor=req.cursor,
        num_pages=req.num_pages,
    )

    # 4. Normalize + deduplicate
    normalized = [normalize_job(r) for r in raw_jobs if r]
    normalized = deduplicate_jobs(normalized)

    # 5. Match score + post-filters
    scored_jobs = []
    for job in normalized:
        # Skip any malformed/empty records from JSearch
        job_id = job.get("id")
        if not job_id:
            continue

        match_details = job_matching_service.match_job(profile_dict, job, use_ai=False)
        job.update(match_details)

        # Salary filter
        if req.salary_min and job.get("salary_max") and job.get("salary_max", 0) < req.salary_min:
            continue

        # Check if already saved
        saved = db.query(SavedJob).filter(
            SavedJob.user_id == current_user_id,
            SavedJob.external_job_id == job_id
        ).first()
        job["is_saved"] = saved is not None
        job["saved_id"] = saved.id if saved else None

        scored_jobs.append(job)


    # 6. Sort
    if req.sort_by == "best_match":
        scored_jobs.sort(key=lambda x: x.get("match_score", 0), reverse=True)
    elif req.sort_by == "newest":
        scored_jobs.sort(key=lambda x: x.get("posted_at", "") or "", reverse=True)
    elif req.sort_by == "salary_high":
        scored_jobs.sort(key=lambda x: x.get("salary_max") or 0.0, reverse=True)
    elif req.sort_by == "salary_low":
        scored_jobs.sort(key=lambda x: x.get("salary_min") or 9999999.0)

    # 7. Log search history
    if current_user_id and current_user_id != "local_user":
        try:
            history = JobSearchHistory(
                id=str(uuid.uuid4()),
                user_id=current_user_id,
                query=req.query or (queries[0] if queries else "Auto Recommended"),
                location=", ".join(locations) if locations else "",
                filters={"sort_by": req.sort_by, "work_mode": req.work_mode, "date_posted": req.date_posted},
                results_count=len(scored_jobs)
            )
            db.add(history)
            db.commit()
        except Exception as e:
            print(f"[!] History log skipped: {e}")
            db.rollback()

    return {
        "success": True,
        "total_results": len(scored_jobs),
        "results": scored_jobs,
        "next_cursor": next_cursor,
        "error_message": err_msg
    }


@router.get("/salary", summary="Get estimated salary for a job title and location via JSearch")
def get_salary(
    job_title: str,
    location: str,
    location_type: str = "CITY",
    years_of_experience: Optional[str] = None,
    current_user_id: str = Depends(_get_user_id)
):
    salary, err = jsearch_service.get_estimated_salary(
        job_title=job_title,
        location=location,
        location_type=location_type,
        years_of_experience=years_of_experience,
    )
    if err:
        return {"success": False, "error": err, "data": None}

    return {
        "success": True,
        "data": {
            "location": location,
            "job_title": job_title,
            "min_salary": salary.get("min_salary"),
            "max_salary": salary.get("max_salary"),
            "median_salary": salary.get("median_salary"),
            "currency": salary.get("salary_currency") or "INR",
            "period": salary.get("salary_period") or "YEAR",
        }
    }


@router.get("/company-salary", summary="Get company-specific salary via JSearch")
def get_company_salary(
    company: str,
    job_title: str,
    location: Optional[str] = None,
    location_type: str = "CITY",
    years_of_experience: Optional[str] = None,
    current_user_id: str = Depends(_get_user_id)
):
    salary, err = jsearch_service.get_company_salary(
        company=company,
        job_title=job_title,
        location=location,
        location_type=location_type,
        years_of_experience=years_of_experience,
    )
    if err:
        return {"success": False, "error": err, "data": None}

    return {"success": True, "data": salary}


# ── Saved Jobs CRUD ───────────────────────────────────────────────────────────

@router.get("/saved", summary="Get all bookmarked jobs")
def get_saved_jobs(db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    jobs = db.query(SavedJob).filter(SavedJob.user_id == current_user_id).all()

    result = []
    for job in jobs:
        app_entry = db.query(JobApplication).filter(JobApplication.saved_job_id == job.id).first()
        result.append({
            "id": job.id,
            "external_id": job.external_job_id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "description": job.description,
            "url": job.url,
            "salary_display": job.salary_display,
            "employment_type": job.employment_type,
            "work_mode": job.work_mode,
            "posted_date": job.posted_date,
            "match_score": job.match_score,
            "matched_skills": job.matched_skills,
            "missing_skills": job.missing_skills,
            "match_reasons": job.match_reasons,
            "status": app_entry.status if app_entry else "saved",
            "application_id": app_entry.id if app_entry else None
        })
    return {"success": True, "jobs": result}


@router.post("/{job_id}/save", summary="Bookmark a job listing")
def save_job(job_id: str, data: JobSaveRequest, db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    existing = db.query(SavedJob).filter(
        SavedJob.user_id == current_user_id,
        SavedJob.external_job_id == data.id
    ).first()

    if existing:
        return {"success": True, "saved_id": existing.id, "message": "Already bookmarked"}

    profile = db.query(JobSearchProfile).filter(JobSearchProfile.user_id == current_user_id).first()

    saved = SavedJob(
        id=str(uuid.uuid4()),
        user_id=current_user_id,
        profile_id=profile.id if profile else None,
        external_job_id=data.id,
        source=data.source,
        title=data.title,
        company=data.company,
        location=data.location,
        description=data.description,
        url=data.url,
        salary_min=data.salary_min,
        salary_max=data.salary_max,
        salary_display=data.salary_display,
        employment_type=data.employment_type,
        work_mode=data.work_mode,
        category=data.category,
        posted_date=data.posted_date,
        match_score=data.match_score,
        matched_skills=data.matched_skills,
        missing_skills=data.missing_skills,
        match_reasons=data.match_reasons
    )
    db.add(saved)

    # Create matching application entry in "saved" stage
    app_entry = JobApplication(
        id=str(uuid.uuid4()),
        user_id=current_user_id,
        saved_job_id=saved.id,
        status="saved"
    )
    db.add(app_entry)
    db.commit()

    return {"success": True, "saved_id": saved.id, "message": "Job bookmarked"}


@router.delete("/{job_id}/save", summary="Remove job bookmark")
def unsave_job(job_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    job = db.query(SavedJob).filter(
        (SavedJob.id == job_id) | (SavedJob.external_job_id == job_id),
        SavedJob.user_id == current_user_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Saved job not found.")

    db.delete(job)
    db.commit()
    return {"success": True, "message": "Bookmark removed"}


# ── AI Analysis Endpoints ─────────────────────────────────────────────────────

@router.post("/{job_id}/analyze", summary="Analyze job description with Gemini")
def analyze_job(job_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    job = db.query(SavedJob).filter(SavedJob.id == job_id, SavedJob.user_id == current_user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Save the job first to perform AI analysis.")

    prompt = f"""
Analyze the job description for the position of '{job.title}' at '{job.company}'.
Identify core technical competencies, educational background alignment, interview preparation areas, and potential warnings.

Job Description:
{job.description}

Return ONLY a valid JSON object matching this schema:
{{
  "matched_skills": ["List of core technical skills this job requires that are common"],
  "missing_skills": ["List of skills mentioned that might represent gaps"],
  "relevant_experience": "Analysis of experience requirements (1-2 sentences)",
  "potential_concerns": ["Any warnings, e.g. strict location requirements, contract details, shift hours"],
  "recommended_resume_changes": ["Actionable phrasing edits, e.g. 'Add your experience deploying APIs'"],
  "interview_topics": ["Topic 1", "Topic 2", "Topic 3"]
}}
"""
    try:
        raw = resume_ai_service._call_gemini(prompt, json_mode=True)
        analysis = resume_ai_service._parse_json(raw)
        return {"success": True, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini analysis failed: {str(e)}")


@router.post("/{job_id}/optimize-resume", summary="Suggest resume optimizations for job description")
def optimize_resume(job_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    job = db.query(SavedJob).filter(SavedJob.id == job_id, SavedJob.user_id == current_user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Save the job first to generate optimization tips.")

    resumes = get_all_resumes(db, current_user_id)
    if not resumes:
        raise HTTPException(status_code=404, detail="Please create a resume first to optimize.")

    latest_resume = resumes[0]
    resume_data = {
        "personal": {"title": latest_resume.title, "location": latest_resume.location},
        "summary": latest_resume.summary,
        "skills": [{"name": s.name} for s in latest_resume.skills if s.name],
        "education": [{"degree": e.degree, "fieldOfStudy": e.field_of_study} for e in latest_resume.education],
        "experience": [{"position": exp.position, "company": exp.company, "description": exp.description} for exp in latest_resume.experience],
        "projects": [{"name": p.name, "description": p.description} for p in latest_resume.projects]
    }

    prompt = f"""
Compare the candidate's current resume against the job description for '{job.title}' at '{job.company}'.
Generate constructive, specific recommendations on how to customize their resume.
Do NOT invent or fabricate any false experience or credentials.

Candidate Resume:
{json.dumps(resume_data, indent=2)}

Target Job Description:
{job.description}

Return ONLY a valid JSON object matching this schema:
{{
  "summary_suggestion": "Suggested phrasing edits for professional summary",
  "experience_suggestions": [
    {{
      "role": "Role company name",
      "suggestion": "How to refine experience bullet points"
    }}
  ],
  "skills_to_highlight": ["Core skills candidate already has that should be positioned prominently"],
  "project_suggestions": [
    {{
      "name": "Project name",
      "suggestion": "How to highlight relevant keywords in description"
    }}
  ]
}}
"""
    try:
        raw = resume_ai_service._call_gemini(prompt, json_mode=True)
        suggestions = resume_ai_service._parse_json(raw)
        return {"success": True, "suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini resume tailoring failed: {str(e)}")


# ── Tracker/Application Endpoints ─────────────────────────────────────────────

@router.get("/applications", summary="Get all applications for the tracker")
def get_applications(db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    apps = db.query(JobApplication).filter(JobApplication.user_id == current_user_id).all()

    result = []
    for app in apps:
        job = db.query(SavedJob).filter(SavedJob.id == app.saved_job_id).first()
        if not job:
            continue
        result.append({
            "id": app.id,
            "saved_job_id": app.saved_job_id,
            "status": app.status,
            "notes": app.notes,
            "applied_at": app.applied_at,
            "updated_at": app.updated_at,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "url": job.url
        })
    return {"success": True, "applications": result}


@router.post("/applications", summary="Create application entry")
def create_application(data: JobApplicationCreate, db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    job = db.query(SavedJob).filter(SavedJob.id == data.saved_job_id, SavedJob.user_id == current_user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Saved job not found.")

    existing = db.query(JobApplication).filter(JobApplication.saved_job_id == data.saved_job_id).first()
    if existing:
        existing.status = data.status
        existing.notes = data.notes
        db.commit()
        return {"success": True, "id": existing.id, "message": "Updated existing application status"}

    app_entry = JobApplication(
        id=str(uuid.uuid4()),
        user_id=current_user_id,
        saved_job_id=data.saved_job_id,
        status=data.status,
        notes=data.notes,
        applied_at=datetime.utcnow() if data.status != "saved" else None
    )
    db.add(app_entry)
    db.commit()
    return {"success": True, "id": app_entry.id, "message": "Application tracked successfully"}


@router.put("/applications/{app_id}", summary="Update application status")
def update_application(app_id: str, data: JobApplicationUpdate, db: Session = Depends(get_db), current_user_id: str = Depends(_get_user_id)):
    app_entry = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user_id
    ).first()

    if not app_entry:
        raise HTTPException(status_code=404, detail="Application tracker item not found.")

    app_entry.status = data.status
    if data.notes is not None:
        app_entry.notes = data.notes

    if data.status == "applied" and not app_entry.applied_at:
        app_entry.applied_at = datetime.utcnow()

    db.commit()
    return {"success": True, "message": "Application status updated"}
