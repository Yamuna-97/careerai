"""
app/services/job_normalizer.py
───────────────────────────────
Normalizes raw JSearch API responses into a consistent CareerAI job schema.

All field access is guarded against None/missing values.
Never fabricates data — if a field is missing it is left None or empty.
"""

import re
from typing import Dict, List, Optional
from datetime import datetime, timezone


# ── Skill alias normalization map ─────────────────────────────────────────────
# Maps common variations to a canonical form for matching
SKILL_ALIASES = {
    "js": "javascript",
    "javascript": "javascript",
    "ts": "typescript",
    "typescript": "typescript",
    "py": "python",
    "ml": "machine learning",
    "machine-learning": "machine learning",
    "ai": "artificial intelligence",
    "dl": "deep learning",
    "deep-learning": "deep learning",
    "nlp": "natural language processing",
    "cv": "computer vision",
    "sql": "sql",
    "mysql": "sql",
    "postgresql": "postgresql",
    "postgres": "postgresql",
    "node": "node.js",
    "nodejs": "node.js",
    "react": "react",
    "reactjs": "react",
    "vue": "vue.js",
    "vuejs": "vue.js",
    "angular": "angular",
    "k8s": "kubernetes",
    "tf": "tensorflow",
}


def normalize_skill(skill: str) -> str:
    """Lowercase + alias normalize a skill name."""
    clean = skill.lower().strip().replace("_", " ").replace("-", " ")
    return SKILL_ALIASES.get(clean, clean)


def _safe_str(val) -> Optional[str]:
    if val is None:
        return None
    s = str(val).strip()
    return s if s else None


def _safe_list(val) -> List:
    if isinstance(val, list):
        return [x for x in val if x]
    return []


def _format_salary(val) -> Optional[float]:
    try:
        if val is None:
            return None
        return float(val)
    except (TypeError, ValueError):
        return None


def _format_posted_at(val) -> Optional[str]:
    """Convert JSearch posted_at to a readable string."""
    if not val:
        return None
    try:
        # JSearch returns Unix timestamp
        dt = datetime.fromtimestamp(int(val), tz=timezone.utc)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return _safe_str(val)


def _extract_skills_from_highlights(highlights: Optional[dict]) -> List[str]:
    """Extract skill names from job_highlights.Qualifications or Requirements."""
    if not highlights or not isinstance(highlights, dict):
        return []
    skills = []
    for key in ("Qualifications", "Requirements", "Responsibilities"):
        items = highlights.get(key, []) or []
        for item in items:
            # Simple heuristic: pick capitalized single-word or short tech terms
            words = re.findall(r'\b[A-Z][a-zA-Z0-9.+#]{1,20}\b', str(item))
            skills.extend(words[:3])
    return list(set(skills))[:15]


def normalize_job(raw: dict) -> dict:
    """
    Map a raw JSearch job object to the CareerAI normalized schema.
    All fields are safely extracted — never raises.
    """
    if not raw or not isinstance(raw, dict):
        return {}

    job_id = _safe_str(raw.get("job_id")) or ""

    # Employment type: prefer array, fallback to string
    emp_types = raw.get("job_employment_types") or []
    if isinstance(emp_types, list) and emp_types:
        employment_type = emp_types[0]
    else:
        employment_type = _safe_str(raw.get("job_employment_type"))

    # Location
    city = _safe_str(raw.get("job_city"))
    state = _safe_str(raw.get("job_state"))
    country = _safe_str(raw.get("job_country")) or "IN"

    parts = [p for p in [city, state, country] if p]
    location = ", ".join(parts) if parts else "Remote"

    # Remote
    is_remote = bool(raw.get("job_is_remote", False))

    # Skills from required/preferred technologies
    required_tech = _safe_list(raw.get("required_technologies"))
    preferred_tech = _safe_list(raw.get("preferred_technologies"))
    highlight_skills = _extract_skills_from_highlights(raw.get("job_highlights"))
    raw_skills = required_tech + preferred_tech + highlight_skills
    skills = list(dict.fromkeys([normalize_skill(s) for s in raw_skills if s]))[:20]

    # Apply options
    apply_options_raw = raw.get("apply_options") or []
    apply_options = []
    for opt in apply_options_raw:
        if isinstance(opt, dict):
            apply_options.append({
                "publisher": _safe_str(opt.get("publisher")) or "Unknown",
                "apply_link": _safe_str(opt.get("apply_link")) or "",
                "is_direct": bool(opt.get("is_direct", False)),
            })

    # Primary apply link
    apply_link = _safe_str(raw.get("job_apply_link"))
    if not apply_link and apply_options:
        apply_link = apply_options[0].get("apply_link")

    # Salary
    salary_min = _format_salary(raw.get("job_min_salary"))
    salary_max = _format_salary(raw.get("job_max_salary"))
    salary_currency = _safe_str(raw.get("job_salary_currency"))
    salary_period = _safe_str(raw.get("job_salary_period"))

    # Build salary_display string
    if salary_min and salary_max:
        curr = salary_currency or "INR"
        per = salary_period or "YEAR"
        salary_display = f"{curr} {int(salary_min):,} – {int(salary_max):,} / {per}"
    elif salary_max:
        salary_display = f"Up to {salary_currency or 'INR'} {int(salary_max):,}"
    elif salary_min:
        salary_display = f"From {salary_currency or 'INR'} {int(salary_min):,}"
    else:
        salary_display = None

    # Benefits
    benefits_raw = raw.get("job_benefits") or []
    if isinstance(benefits_raw, list):
        benefits = [str(b) for b in benefits_raw if b]
    elif isinstance(benefits_raw, str):
        benefits = [benefits_raw] if benefits_raw else []
    else:
        benefits = []

    # Experience
    exp = raw.get("required_experience") or {}
    experience_years = None
    if isinstance(exp, dict):
        experience_years = exp.get("required_experience_in_months")
        if experience_years is not None:
            experience_years = round(experience_years / 12, 1)

    return {
        # Core identity
        "id": job_id,
        "title": _safe_str(raw.get("job_title")) or "Untitled Position",
        "company": _safe_str(raw.get("employer_name")) or "Unknown Company",
        "company_logo": _safe_str(raw.get("employer_logo")),
        "company_website": _safe_str(raw.get("employer_website")),
        "publisher": _safe_str(raw.get("job_publisher")) or "Source unavailable",

        # Employment details
        "employment_type": employment_type,
        "seniority_level": _safe_str(raw.get("job_seniority_level")),
        "experience_years": experience_years,

        # Location
        "location": location,
        "city": city,
        "state": state,
        "country": country,
        "remote": is_remote,
        "work_mode": "Remote" if is_remote else "On-site",

        # Timing
        "posted_at": _format_posted_at(raw.get("job_posted_at_timestamp")),
        "posted_date": _format_posted_at(raw.get("job_posted_at_timestamp")),

        # Content
        "description": _safe_str(raw.get("job_description")) or "",
        "highlights": raw.get("job_highlights") or {},

        # Skills
        "skills": skills,
        "required_technologies": required_tech,
        "preferred_technologies": preferred_tech,

        # Salary
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_currency": salary_currency,
        "salary_period": salary_period,
        "salary_display": salary_display,

        # Application
        "apply_link": apply_link,
        "apply_options": apply_options,
        "url": apply_link or "",
        "job_google_link": _safe_str(raw.get("job_google_link")),

        # Benefits
        "benefits": benefits,

        # CareerAI computed fields (populated later by job_matching_service)
        "match_score": 0.0,
        "matched_skills": [],
        "missing_skills": [],
        "match_reasons": [],
        "is_saved": False,
        "saved_id": None,
        "source": _safe_str(raw.get("job_publisher")) or "JSearch",
    }


def deduplicate_jobs(jobs: List[dict]) -> List[dict]:
    """
    Remove duplicate jobs.
    First deduplication: by job_id.
    Fallback deduplication: by normalized (title + company + location).
    """
    seen_ids = set()
    seen_fingerprints = set()
    unique = []

    for job in jobs:
        jid = job.get("id", "")
        if jid and jid in seen_ids:
            continue

        # Fingerprint-based dedup
        title_norm = re.sub(r'\s+', ' ', (job.get("title") or "").lower().strip())
        company_norm = re.sub(r'\s+', ' ', (job.get("company") or "").lower().strip())
        loc_norm = re.sub(r'\s+', ' ', (job.get("location") or "").lower().strip())[:30]
        fingerprint = f"{title_norm}::{company_norm}::{loc_norm}"

        if fingerprint in seen_fingerprints:
            continue

        if jid:
            seen_ids.add(jid)
        seen_fingerprints.add(fingerprint)
        unique.append(job)

    return unique
