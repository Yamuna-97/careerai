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
from app.services.resume_ai_service import _call_gemini, _parse_json


def match_job(profile: Dict, job: Dict) -> Dict:
    """
    Compare a JobSearchProfile (dict) against a Job (dict).
    Returns compatibility details:
        match_score: float (0.0 to 100.0)
        matched_skills: list of strings
        missing_skills: list of strings
        match_reasons: list of bullet reasons
    """
    if settings.GEMINI_API_KEY and settings.AI_PROVIDER != "none":
        try:
            return _ai_match_job(profile, job)
        except Exception as e:
            print(f"[!] AI Job Matching failed: {e}. Falling back to heuristics.")
            pass
            
    return _heuristic_match_job(profile, job)


def _heuristic_match_job(profile: Dict, job: Dict) -> Dict:
    """
    Fast, offline, regex-based matching algorithm.
    Weights:
        - Role title match: 35%
        - Skill match: 45%
        - Work mode / Location preference: 20%
    """
    title = job.get("title", "").lower()
    description = job.get("description", "").lower()
    
    # 1. Skill Matching (45% weight)
    profile_skills = [s for s in profile.get("skills", []) if s]
    matched_skills = []
    missing_skills = []
    
    for skill in profile_skills:
        skill_clean = skill.lower().strip()
        pattern = r'\b' + re.escape(skill_clean) + r'\b'
        if re.search(pattern, title) or re.search(pattern, description):
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)
            
    skill_score = 0.0
    if profile_skills:
        skill_score = (len(matched_skills) / len(profile_skills)) * 45.0
        
    # 2. Role Title Matching (35% weight)
    role_score = 0.0
    target_roles = [r.lower() for r in profile.get("target_roles", []) if r]
    role_matched = False
    for role in target_roles:
        if role in title:
            role_score = 35.0
            role_matched = True
            break
    if not role_matched and target_roles:
        # Check partial overlap of words
        for role in target_roles:
            words = role.split()
            overlap_words = [w for w in words if w in title]
            if overlap_words:
                role_score = (len(overlap_words) / len(words)) * 25.0
                break
                
    # 3. Location / Work Mode Matching (20% weight)
    loc_score = 10.0  # Base score for location/mode
    pref_modes = [m.lower() for m in profile.get("work_modes", [])]
    job_loc = job.get("location", "").lower()
    
    # Remote check
    if "remote" in pref_modes and "remote" in job_loc:
        loc_score += 10.0
    else:
        pref_locs = [l.lower() for l in profile.get("locations", [])]
        for pl in pref_locs:
            if pl in job_loc:
                loc_score += 10.0
                break
                
    match_score = min(100.0, round(skill_score + role_score + loc_score, 1))
    if match_score < 0:
        match_score = 0.0
        
    # Generate human-readable reasons
    reasons = []
    if role_matched:
        reasons.append(f"Title matches target role '{job.get('title')}'")
    elif role_score > 0:
        reasons.append("Matches keywords in your target roles")
        
    if len(matched_skills) > 0:
        reasons.append(f"Requires key skills you have: {', '.join(matched_skills[:3])}")
    
    if "remote" in job_loc:
        reasons.append("Offers remote work flexibility")
    elif loc_score > 10.0:
        reasons.append(f"Matches location preference: {job.get('location')}")
        
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
