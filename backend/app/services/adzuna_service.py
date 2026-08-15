"""
app/services/adzuna_service.py
───────────────────────────────
Secure proxy service for the Adzuna Jobs API.

ALL Adzuna API credentials are handled here on the backend.
They are NEVER exposed to the frontend or included in any response.

Responsibilities:
  - Build authenticated Adzuna requests
  - Generate smart search queries from user profile
  - Normalize Adzuna responses into CareerAI job schema
  - Deduplicate results across multiple queries
  - Handle pagination, errors, and rate limits gracefully
"""

import httpx
import hashlib
import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone
from app.core.config import settings

# ── Constants ────────────────────────────────────────────────────────────────

ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs"
RESULTS_PER_PAGE = 20

# Map user location strings → Adzuna country codes
LOCATION_TO_COUNTRY: Dict[str, str] = {
    "india": "in", "chennai": "in", "bangalore": "in", "bengaluru": "in",
    "hyderabad": "in", "mumbai": "in", "delhi": "in", "pune": "in",
    "coimbatore": "in", "erode": "in", "kolkata": "in", "ahmedabad": "in",
    "uk": "gb", "london": "gb", "manchester": "gb",
    "usa": "us", "new york": "us", "san francisco": "us", "seattle": "us",
    "canada": "ca", "toronto": "ca",
    "australia": "au", "sydney": "au",
    "remote": "in",   # Default remote to India search
}

# Adzuna category mappings for common tech roles
ROLE_TO_ADZUNA_CATEGORY = {
    "software engineer": "it-jobs",
    "machine learning": "it-jobs",
    "data scientist": "it-jobs",
    "data analyst": "it-jobs",
    "frontend developer": "it-jobs",
    "backend developer": "it-jobs",
    "full stack developer": "it-jobs",
    "ai engineer": "it-jobs",
    "python developer": "it-jobs",
    "devops": "it-jobs",
    "cloud engineer": "it-jobs",
    "product manager": "it-jobs",
    "designer": "it-jobs",
}

# ── Demo job data for when Adzuna credentials are not configured ─────────────
DEMO_JOBS = [
    {
        "id": "demo_001", "source": "demo",
        "title": "Machine Learning Engineer", "company": "TechCorp India",
        "location": "Bangalore, India", "work_mode": "Hybrid",
        "employment_type": "Full-time", "salary_min": 800000, "salary_max": 1200000,
        "salary_display": "₹8L – ₹12L", "category": "IT Jobs",
        "description": "Build and deploy ML models for production. Work with PyTorch, TensorFlow and FastAPI.",
        "url": "https://www.adzuna.in", "posted_date": "2026-08-12",
        "matched_skills": ["Python", "Machine Learning", "PyTorch"],
        "missing_skills": ["AWS", "Docker"], "match_score": 88.0,
        "match_reasons": ["Python matches your skills", "ML role matches your target"]
    },
    {
        "id": "demo_002", "source": "demo",
        "title": "AI Engineer – NLP", "company": "Infosys BPM",
        "location": "Chennai, India", "work_mode": "Onsite",
        "employment_type": "Full-time", "salary_min": 600000, "salary_max": 900000,
        "salary_display": "₹6L – ₹9L", "category": "IT Jobs",
        "description": "Develop NLP pipelines, fine-tune LLMs, and integrate them into enterprise systems.",
        "url": "https://www.adzuna.in", "posted_date": "2026-08-13",
        "matched_skills": ["Python", "NLP", "TensorFlow"],
        "missing_skills": ["Kubernetes"], "match_score": 82.0,
        "match_reasons": ["Chennai matches your preferred location", "NLP aligns with AI skills"]
    },
    {
        "id": "demo_003", "source": "demo",
        "title": "Data Scientist – Analytics", "company": "Zoho Corporation",
        "location": "Chennai, India", "work_mode": "Hybrid",
        "employment_type": "Full-time", "salary_min": 700000, "salary_max": 1100000,
        "salary_display": "₹7L – ₹11L", "category": "IT Jobs",
        "description": "Analyze large datasets, build predictive models, and present insights to leadership.",
        "url": "https://www.adzuna.in", "posted_date": "2026-08-11",
        "matched_skills": ["Python", "SQL", "Data Analysis"],
        "missing_skills": ["Tableau"], "match_score": 79.0,
        "match_reasons": ["Data Scientist matches target role", "SQL in your skillset"]
    },
    {
        "id": "demo_004", "source": "demo",
        "title": "Python Developer – Backend", "company": "Freshworks",
        "location": "Chennai, India", "work_mode": "Remote",
        "employment_type": "Full-time", "salary_min": 900000, "salary_max": 1400000,
        "salary_display": "₹9L – ₹14L", "category": "IT Jobs",
        "description": "Build scalable REST APIs using FastAPI and Django. Contribute to CI/CD pipelines.",
        "url": "https://www.adzuna.in", "posted_date": "2026-08-10",
        "matched_skills": ["Python", "FastAPI", "REST APIs"],
        "missing_skills": ["Redis", "Celery"], "match_score": 91.0,
        "match_reasons": ["FastAPI matches your project experience", "Python is your primary language"]
    },
]


# ── Helper: Determine Adzuna Country Code ─────────────────────────────────────
def _get_country_code(locations: List[str]) -> str:
    """Map user-selected locations to the best Adzuna country code."""
    for loc in locations:
        key = loc.lower().strip()
        if key in LOCATION_TO_COUNTRY:
            return LOCATION_TO_COUNTRY[key]
    return settings.ADZUNA_COUNTRY or "in"  # Fallback to configured country


def _get_adzuna_location(locations: List[str]) -> Optional[str]:
    """Extract a usable city string for the Adzuna where parameter."""
    city_keywords = ["chennai", "bangalore", "bengaluru", "hyderabad", "mumbai",
                     "delhi", "pune", "coimbatore", "erode", "kolkata"]
    for loc in locations:
        key = loc.lower().strip()
        if key in city_keywords:
            return loc.title()
    if any(loc.lower() == "remote" for loc in locations):
        return None  # Don't restrict by city for remote
    return None


# ── Helper: Generate Smart Search Queries ────────────────────────────────────
def generate_search_queries(
    target_roles: List[str],
    skills: List[str],
    keywords: List[str],
    experience_level: str
) -> List[str]:
    """
    Generate 3–5 high-quality Adzuna search queries.
    Avoids creating hundreds of queries — focuses on signal.
    """
    queries = []
    top_skills = skills[:3]
    top_keywords = keywords[:2]

    # 1. Primary role query
    if target_roles:
        primary_role = target_roles[0]
        queries.append(primary_role)

        # 2. Role + top skill
        if top_skills:
            queries.append(f"{primary_role} {top_skills[0]}")

        # 3. Role + 2 skills
        if len(top_skills) >= 2:
            queries.append(f"{top_skills[0]} {top_skills[1]}")

    # 4. Keyword-based query
    if top_keywords:
        queries.append(" ".join(top_keywords))

    # 5. Secondary role if available
    if len(target_roles) >= 2:
        queries.append(target_roles[1])

    # Deduplicate and cap at 5
    seen = set()
    unique_queries = []
    for q in queries:
        q_norm = q.lower().strip()
        if q_norm not in seen and q_norm:
            seen.add(q_norm)
            unique_queries.append(q)
    return unique_queries[:5]


# ── Helper: Normalize a Single Adzuna Job ────────────────────────────────────
def _normalize_job(raw: dict) -> dict:
    """Convert one raw Adzuna job dict into the CareerAI job schema."""

    # Extract salary
    salary_min = raw.get("salary_min")
    salary_max = raw.get("salary_max")
    salary_display = ""
    if salary_min and salary_max:
        # Convert to lakhs if currency is INR (Adzuna returns annual in GBP/USD/INR)
        if salary_min >= 100000:
            salary_display = f"₹{salary_min/100000:.0f}L – ₹{salary_max/100000:.0f}L"
        else:
            salary_display = f"₹{int(salary_min):,} – ₹{int(salary_max):,}"

    # Parse posted date
    created = raw.get("created", "")
    posted_date = ""
    if created:
        try:
            dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
            posted_date = dt.strftime("%Y-%m-%d")
        except Exception:
            posted_date = created[:10] if len(created) >= 10 else created

    # Build a stable unique ID from Adzuna's redirect URL
    redirect_url = raw.get("redirect_url", "")
    job_id_str = raw.get("id", redirect_url or raw.get("title", ""))
    job_id = "az_" + hashlib.md5(str(job_id_str).encode()).hexdigest()[:12]

    # Location
    location_raw = raw.get("location", {})
    if isinstance(location_raw, dict):
        display_name = location_raw.get("display_name", "")
        area = location_raw.get("area", [])
        location_str = display_name or (", ".join(area[-2:]) if area else "")
    else:
        location_str = str(location_raw)

    # Category
    category_raw = raw.get("category", {})
    category_label = category_raw.get("label", "") if isinstance(category_raw, dict) else ""

    # Contract type → employment type
    contract_type = raw.get("contract_type", "")
    contract_time = raw.get("contract_time", "")
    employment_type = ""
    if contract_type:
        employment_type = contract_type.replace("_", " ").title()
    elif contract_time:
        employment_type = contract_time.replace("_", " ").title()

    # Clean description
    description = raw.get("description", "")
    description = re.sub(r"<[^>]+>", "", description)  # Strip HTML tags

    return {
        "id": job_id,
        "source": "adzuna",
        "external_id": str(job_id_str),
        "title": raw.get("title", ""),
        "company": raw.get("company", {}).get("display_name", "") if isinstance(raw.get("company"), dict) else str(raw.get("company", "")),
        "location": location_str,
        "work_mode": "",   # Adzuna doesn't always provide this; AI matching will infer
        "employment_type": employment_type,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_display": salary_display,
        "category": category_label,
        "description": description[:2000],   # Cap for performance
        "url": redirect_url,
        "posted_date": posted_date,
        "matched_skills": [],
        "missing_skills": [],
        "match_score": 0.0,
        "match_reasons": [],
    }


# ── Core: Search Adzuna ───────────────────────────────────────────────────────
def search_jobs(
    queries: List[str],
    locations: List[str],
    employment_types: List[str],
    experience_level: str,
    page: int = 1,
    results_per_page: int = RESULTS_PER_PAGE,
    date_filter_days: Optional[int] = None,
) -> Tuple[List[dict], int, bool, str]:
    """
    Execute Adzuna job searches for the given queries and location.

    Returns:
        (jobs_list, total_count, is_demo_mode, error_message)
    """
    # Check credentials
    if not settings.ADZUNA_APP_ID or not settings.ADZUNA_APP_KEY:
        return DEMO_JOBS, len(DEMO_JOBS), True, ""

    country_code = _get_country_code(locations)
    location_str = _get_adzuna_location(locations)

    all_jobs: Dict[str, dict] = {}  # id → job, for deduplication
    total_count = 0
    last_error = ""

    for query in queries[:5]:   # Max 5 queries
        try:
            params = {
                "app_id": settings.ADZUNA_APP_ID,
                "app_key": settings.ADZUNA_APP_KEY,
                "results_per_page": results_per_page,
                "page": page,
                "what": query,
                "content-type": "application/json",
            }

            if location_str:
                params["where"] = location_str

            # Employment type filter
            if employment_types and "any" not in [e.lower() for e in employment_types]:
                for et in employment_types:
                    et_lower = et.lower()
                    if "full" in et_lower:
                        params["full_time"] = "1"
                    elif "part" in et_lower:
                        params["part_time"] = "1"

            # Date filter
            if date_filter_days:
                params["max_days_old"] = date_filter_days

            url = f"{ADZUNA_BASE}/{country_code}/search/{page}"

            with httpx.Client(timeout=15.0) as client:
                resp = client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()

            raw_results = data.get("results", [])
            count = data.get("count", 0)
            total_count = max(total_count, count)

            for raw in raw_results:
                job = _normalize_job(raw)
                if job["id"] not in all_jobs:
                    all_jobs[job["id"]] = job

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                last_error = "Invalid Adzuna credentials. Check ADZUNA_APP_ID and ADZUNA_APP_KEY in .env."
            elif e.response.status_code == 429:
                last_error = "Adzuna rate limit reached. Please try again in a few minutes."
            else:
                last_error = f"Adzuna API error: {e.response.status_code}"
            break
        except httpx.TimeoutException:
            last_error = "Job search timed out. Please try again."
            break
        except Exception as e:
            last_error = f"Job search error: {str(e)}"
            break

    jobs_list = list(all_jobs.values())

    # If all queries failed and no jobs found, use demo mode
    if not jobs_list and last_error:
        return DEMO_JOBS, len(DEMO_JOBS), True, last_error

    return jobs_list, total_count, False, last_error


# ── Search from Resume Profile ────────────────────────────────────────────────
def search_from_profile(profile: dict, page: int = 1) -> Tuple[List[dict], int, bool, str]:
    """
    Convenience wrapper: build search from a saved JobSearchProfile dict.
    """
    queries = generate_search_queries(
        target_roles=profile.get("target_roles", []),
        skills=profile.get("skills", []),
        keywords=profile.get("keywords", []),
        experience_level=profile.get("experience_level", "any"),
    )
    return search_jobs(
        queries=queries,
        locations=profile.get("locations", []),
        employment_types=profile.get("employment_types", []),
        experience_level=profile.get("experience_level", "any"),
        page=page,
    )
