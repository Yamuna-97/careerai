"""
app/services/job_matching_service.py
────────────────────────────────────
Service to calculate compatibility scores and detailed match breakdowns between
a user's JobSearchProfile and a given job listing.
Supports both LLM-based evaluation and a fast programmatic fallback.
"""

import re
import json
from typing import Dict, List, Tuple
from app.core.config import settings
from app.services.gemini_service import call_gemini_api as _call_gemini, clean_and_parse_json as _parse_json


def match_job(profile: Dict, job: Dict, use_ai: bool = False) -> Dict:
    """
    Compare a JobSearchProfile (dict) against a Job (dict).
    Returns compatibility details:
        match_score: float (0.0 to 100.0)
        matched_skills: list of strings
        missing_skills: list of strings
        match_reasons: list of bullet reasons
    """
    if use_ai and settings.GEMINI_API_KEY and settings.AI_PROVIDER != "none":
        try:
            return _ai_match_job(profile, job)
        except Exception as e:
            print(f"[!] AI Job Matching failed: {e}. Falling back to fast heuristics.")
            pass
            
    return _heuristic_match_job(profile, job)


def _heuristic_match_job(profile: Dict, job: Dict) -> Dict:
    """
    Fast, offline, regex-based matching algorithm.
    Weights:
        - Skill match: 50%
        - Role title match: 20%
        - Location / Work mode: 15%
        - Employment type: 10%
        - Experience level: 5%
    """
    title = (job.get("title") or "").lower()
    description = (job.get("description") or "").lower()

    # Normalized skill list from JSearch (via job_normalizer)
    job_skills_normalized = set((job.get("skills") or []))

    # 1. Skill Matching (50% weight)
    profile_skills = [s for s in (profile.get("skills") or []) if s]
    matched_skills = []
    missing_skills = []

    for skill in profile_skills:
        skill_clean = skill.lower().strip().replace("-", " ").replace("_", " ")
        # Check normalized skills list first
        found = skill_clean in job_skills_normalized
        # Fallback: scan title and description
        if not found:
            pattern = r'\b' + re.escape(skill_clean) + r'\b'
            found = bool(re.search(pattern, title) or re.search(pattern, description))
        if found:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    skill_score = 0.0
    if profile_skills:
        skill_score = (len(matched_skills) / len(profile_skills)) * 50.0

    # 2. Role Title Matching (20% weight)
    role_score = 0.0
    target_roles = [r.lower() for r in (profile.get("target_roles") or []) if r]
    role_matched = False
    for role in target_roles:
        if role in title:
            role_score = 20.0
            role_matched = True
            break
    if not role_matched and target_roles:
        for role in target_roles:
            words = role.split()
            overlap_words = [w for w in words if w in title]
            if overlap_words:
                role_score = (len(overlap_words) / len(words)) * 15.0
                break

    # 3. Location / Work Mode Matching (15% weight)
    loc_score = 5.0  # base
    pref_modes = [m.lower() for m in (profile.get("work_modes") or [])]
    is_remote = bool(job.get("remote", False))
    job_loc = (job.get("location") or "").lower()

    if "remote" in pref_modes and is_remote:
        loc_score = 15.0
    else:
        pref_locs = [l.lower() for l in (profile.get("locations") or [])]
        for pl in pref_locs:
            if pl and pl in job_loc:
                loc_score = 15.0
                break

    # 4. Employment Type Matching (10% weight)
    emp_score = 5.0  # default partial match
    pref_emp = [e.lower() for e in (profile.get("employment_types") or [])]
    job_emp = (job.get("employment_type") or "").lower()
    if pref_emp and job_emp:
        type_map = {
            "full_time": ["fulltime", "full-time", "full_time"],
            "internship": ["intern", "internship"],
            "contract": ["contractor", "contract"],
            "part_time": ["parttime", "part-time", "part_time"],
        }
        for pref in pref_emp:
            aliases = type_map.get(pref, [pref])
            if any(a in job_emp for a in aliases) or pref in job_emp:
                emp_score = 10.0
                break

    # 5. Experience Level (5% weight)
    exp_score = 3.0
    profile_exp = (profile.get("experience_level") or "mid").lower()
    exp_years = job.get("experience_years")
    if exp_years is not None:
        if profile_exp in ("internship", "entry", "junior") and exp_years <= 2:
            exp_score = 5.0
        elif profile_exp in ("mid",) and 2 <= exp_years <= 5:
            exp_score = 5.0
        elif profile_exp in ("senior",) and exp_years >= 5:
            exp_score = 5.0

    match_score = min(100.0, round(skill_score + role_score + loc_score + emp_score + exp_score, 1))
    if match_score < 0:
        match_score = 0.0

    # Generate human-readable reasons
    reasons = []
    if role_matched:
        reasons.append(f"Title matches your target role '{job.get('title')}'")
    elif role_score > 0:
        reasons.append("Matches keywords in your target roles")

    if matched_skills:
        reasons.append(f"Requires skills you have: {', '.join(matched_skills[:3])}")

    if is_remote and "remote" in pref_modes:
        reasons.append("Offers remote work flexibility")
    elif loc_score >= 15.0:
        reasons.append(f"Location matches your preference: {job.get('location')}")

    if not reasons:
        reasons.append("Matches general technical keywords in your profile")

    return {
        "match_score": float(match_score),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills[:5],
        "match_reasons": reasons
    }


def _ai_match_job(profile: Dict, job: Dict) -> Dict:
    """
    Call Gemini LLM to perform deep semantic fit analysis.
    """
    prompt = f"""
Analyze the suitability of this job for a candidate based on their JobSearchProfile.

Job Details:
Title: {job.get('title')}
Company: {job.get('company')}
Location: {job.get('location')}
Description: {job.get('description')}

Candidate Profile:
Target Roles: {profile.get('target_roles')}
Skills: {profile.get('skills')}
Keywords: {profile.get('keywords')}
Experience Level: {profile.get('experience_level')}

Evaluate candidate compatibility and return ONLY a valid JSON object matching this schema:
{{
  "match_score": 0.0-100.0,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "match_reasons": [
    "Exactly matches your target role 'X'",
    "Strong skill alignment with Y and Z",
    "Meets your location preference"
  ]
}}
"""
    raw = _call_gemini(prompt, json_mode=True)
    return _parse_json(raw)
