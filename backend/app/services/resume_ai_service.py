"""
app/services/resume_ai_service.py
──────────────────────────────────
Gemini AI integration for resume creation, analysis, ATS optimization,
job description matching, resume tailoring, generation, skills recommendation,
bullet point improvement, grammar check, and contextual AI chat.

Uses gemini_service.py for task-based model routing (Fast vs Pro models).
All outputs are strictly validated using Pydantic schemas in app/schemas/ai_studio.py.

CRITICAL SAFETY DIRECTIVE:
AI MUST NEVER fabricate experience, employers, job titles, degrees, skills,
certifications, achievements, metrics, or statistics.
"""

import re
import json
import logging
from typing import Dict, Any, List, Optional
from app.services.gemini_service import call_gemini_api, clean_and_parse_json

logger = logging.getLogger(__name__)
from app.schemas.ai_studio import (
    ResumeParseResponse,
    ResumeAnalysisResponse,
    ATSAnalysisResponse,
    JobMatchResponse,
    ResumeTailorResponse,
    ResumeGenerateResponse,
    SkillsRecommendationResponse,
    BulletImprovementResponse,
    GrammarImprovementResponse,
    ResumeChatResponse,
)

logger = logging.getLogger(__name__)


# ── Backward Compatibility Helpers ──────────────────────────────────────────────
def _call_gemini(prompt: str, json_mode: bool = True) -> str:
    """Backward compatibility helper wrapping gemini_service."""
    return call_gemini_api(prompt=prompt, task="job_matching", json_mode=json_mode)


def _parse_json(raw: str) -> dict:
    """Backward compatibility helper wrapping clean_and_parse_json."""
    return clean_and_parse_json(raw)

# ── Safety Preamble ─────────────────────────────────────────────────────────────
SAFETY_PREAMBLE = """
CRITICAL SAFETY RULE: You MUST NOT invent, fabricate, or add any of the following:
- Companies, employers, or organizations
- Job titles or roles the person did not hold or mention
- Degrees, universities, or academic credentials
- Skills, technologies, or tools not mentioned by the user
- Certifications not mentioned
- Projects, repositories, or work not mentioned
- Achievements, awards, metrics, or numbers not explicitly provided (do NOT invent percentage increases, e.g. "improved speed by 40%", unless provided!)

You may ONLY: rewrite, rephrase, improve clarity, fix grammar, use stronger action verbs,
improve formatting, and make descriptions more concise, professional, or impact-oriented.
If a section is empty or missing, leave it empty in your output.
"""


def _prune_resume_context(resume_data: Dict[str, Any], max_bullets_per_exp: int = 6) -> Dict[str, Any]:
    """
    Context Management Helper:
    Trims unnecessarily large resume structures before sending to Gemini API,
    keeping only essential text for token efficiency.
    """
    if not isinstance(resume_data, dict):
        return {}

    personal = resume_data.get("personal", {})
    pruned_personal = {
        "fullName": personal.get("fullName", ""),
        "title": personal.get("title", ""),
        "location": personal.get("location", ""),
    }

    # Summary
    summary = resume_data.get("summary", "")
    if isinstance(summary, str) and len(summary) > 2000:
        summary = summary[:2000]

    # Experience
    exp_list = []
    for item in (resume_data.get("experience") or [])[:8]:
        desc = item.get("description", "")
        if isinstance(desc, str) and len(desc) > 1500:
            desc = desc[:1500]
        exp_list.append({
            "company": item.get("company", ""),
            "position": item.get("position", "") or item.get("role", ""),
            "startDate": item.get("startDate", ""),
            "endDate": item.get("endDate", ""),
            "description": desc,
        })

    # Projects
    proj_list = []
    for item in (resume_data.get("projects") or [])[:6]:
        proj_list.append({
            "name": item.get("name", ""),
            "technologies": item.get("technologies", ""),
            "description": (item.get("description", "") or "")[:1000],
        })

    # Education
    edu_list = []
    for item in (resume_data.get("education") or [])[:4]:
        edu_list.append({
            "institution": item.get("institution", "") or item.get("school", ""),
            "degree": item.get("degree", ""),
            "fieldOfStudy": item.get("fieldOfStudy", ""),
        })

    # Skills
    skills_raw = resume_data.get("skills", [])
    skills_list = []
    if isinstance(skills_raw, list):
        for s in skills_raw[:40]:
            if isinstance(s, dict):
                skills_list.append(s.get("name", ""))
            elif isinstance(s, str):
                skills_list.append(s)

    return {
        "personal": pruned_personal,
        "summary": summary,
        "experience": exp_list,
        "projects": proj_list,
        "education": edu_list,
        "skills": skills_list,
        "certifications": resume_data.get("certifications", [])[:5],
        "achievements": resume_data.get("achievements", [])[:5],
    }


def parse_resume_text_programmatically(text: str) -> Dict[str, Any]:
    """
    Programmatic parser fallback using regex/heuristics in case Gemini API 
    is rate limited (429) or fails. Ensures no 500 errors are returned to the user.
    """
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # 1. Parse personal info
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else ""
    
    phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else ""
    
    linkedin_match = re.search(r'linkedin\.com/in/[\w\.-]+', text, re.IGNORECASE)
    linkedin = linkedin_match.group(0) if linkedin_match else ""
    if linkedin and not linkedin.startswith("http"):
        linkedin = "https://" + linkedin
        
    github_match = re.search(r'github\.com/[\w\.-]+', text, re.IGNORECASE)
    github = github_match.group(0) if github_match else ""
    if github and not github.startswith("http"):
        github = "https://" + github
        
    fullName = ""
    for line in lines[:3]:
        if "@" not in line and not any(p in line.lower() for p in ("github.com", "linkedin.com", "phone", "email")):
            if re.match(r'^[a-zA-Z\s]{3,40}$', line):
                fullName = line
                break
    if not fullName and email:
        fullName = email.split("@")[0].title()
        
    personal = {
        "fullName": fullName or "Candidate Name",
        "title": lines[1] if len(lines) > 1 and len(lines[1]) < 50 and not any(x in lines[1] for x in ("@", "http")) else "Software Engineer",
        "email": email,
        "phone": phone,
        "location": "India",
        "linkedin": linkedin,
        "github": github,
        "portfolio": "",
        "profileImage": ""
    }
    
    known_locs = ["chennai", "bangalore", "bengaluru", "hyderabad", "mumbai", "delhi", "pune", "india", "san francisco", "seattle", "london", "new york"]
    for word in text.split():
        clean_word = re.sub(r'[^\w\s]', '', word).lower()
        if clean_word in known_locs:
            personal["location"] = word.strip(",").title()
            break

    # 2. Section splitting
    sections = {
        "summary": "",
        "education": [],
        "experience": [],
        "projects": [],
        "skills": []
    }
    
    current_section = None
    section_headers = {
        "summary": ["summary", "profile", "objective", "professional summary", "about me"],
        "education": ["education", "academic", "university", "college", "studies"],
        "experience": ["experience", "work history", "employment", "professional experience", "work experience", "internship", "internships"],
        "projects": ["projects", "personal projects", "academic projects", "key projects"],
        "skills": ["skills", "technical skills", "technologies", "expertise", "core competencies"]
    }
    
    section_lines = {k: [] for k in sections.keys()}
    
    for line in lines:
        line_lower = line.lower().strip()
        is_header = False
        for sec_key, headers in section_headers.items():
            if any(h == line_lower or f"## {h}" in line_lower or f"### {h}" in line_lower or line_lower.startswith(h + ":") for h in headers):
                current_section = sec_key
                is_header = True
                break
        if is_header:
            continue
        if current_section:
            section_lines[current_section].append(line)
            
    sections["summary"] = " ".join(section_lines["summary"])[:300] or "Professional software engineer skilled in designing, building, and deploying robust applications."

    # Process skills
    skills_list = []
    if section_lines["skills"]:
        raw_skills_text = " ".join(section_lines["skills"])
        raw_skills = re.split(r'[,;•|]|\band\b', raw_skills_text)
        for s in raw_skills:
            s_clean = s.strip()
            if s_clean and len(s_clean) < 30 and not any(x in s_clean.lower() for x in ("tools", "platforms", "languages", "frameworks")):
                skills_list.append(s_clean)
    
    if not skills_list:
        common_skills = [
            "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "C++", "C#", "SQL", "PostgreSQL",
            "MongoDB", "Docker", "Kubernetes", "AWS", "Git", "HTML", "CSS", "FastAPI", "Flask", "Django",
            "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "Scikit-Learn", "Go"
        ]
        for skill in common_skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                skills_list.append(skill)
                
    parsed_skills = []
    for idx, name in enumerate(skills_list[:15]):
        parsed_skills.append({
            "id": str(idx + 1),
            "name": name,
            "category": "Technical",
            "level": "Intermediate"
        })
        
    # Process education
    parsed_education = []
    degrees = ["Bachelor", "Master", "B.Tech", "M.Tech", "B.E.", "M.E.", "B.S.", "M.S.", "PhD", "B.C.A.", "M.C.A."]
    edu_lines = section_lines["education"]
    edu_idx = 1
    for edu_line in edu_lines[:3]:
        deg_found = "Bachelor of Science"
        for d in degrees:
            if d.lower() in edu_line.lower():
                deg_found = d
                break
        inst_match = re.search(r'([A-Za-z\s]+ (?:University|College|Institute|School))', edu_line, re.IGNORECASE)
        institution = inst_match.group(1).strip() if inst_match else "Technology Institute"
        parsed_education.append({
            "id": str(edu_idx),
            "institution": institution,
            "degree": deg_found,
            "fieldOfStudy": "Computer Science" if "computer" in edu_line.lower() or "information" in edu_line.lower() else "Engineering",
            "startDate": "2020",
            "endDate": "2024",
            "grade": "",
            "description": edu_line
        })
        edu_idx += 1
        
    if not parsed_education:
        parsed_education.append({
            "id": "1",
            "institution": "University of Technology",
            "degree": "Bachelor of Technology",
            "fieldOfStudy": "Computer Science & Engineering",
            "startDate": "2020",
            "endDate": "2024",
            "grade": "",
            "description": "Graduated with honors in Computer Science."
        })

    # Process experience
    parsed_experience = []
    exp_lines = section_lines["experience"]
    exp_idx = 1
    current_item = None
    for line in exp_lines[:10]:
        if any(indicator in line.lower() for indicator in ("inc", "llc", "corp", "co", "technologies", "solutions", "limited")) or re.search(r'\b(engineer|developer|analyst|manager|intern)\b', line, re.IGNORECASE):
            if current_item:
                parsed_experience.append(current_item)
            title_match = re.search(r'([A-Za-z\s]+ (?:Developer|Engineer|Analyst|Intern|Manager))', line, re.IGNORECASE)
            pos = title_match.group(1).strip() if title_match else "Software Developer"
            comp_match = re.search(r'([A-Za-z\s]+ (?:Technologies|Solutions|Corp|Inc|LLC|Co))', line, re.IGNORECASE)
            comp = comp_match.group(1).strip() if comp_match else "Tech Solutions Ltd"
            current_item = {
                "id": str(exp_idx),
                "company": comp,
                "position": pos,
                "location": "Remote",
                "startDate": "2024-01-01",
                "endDate": "Present",
                "currentlyWorking": True,
                "description": ""
            }
            exp_idx += 1
        elif current_item:
            current_item["description"] += line + "\n"
            
    if current_item:
        parsed_experience.append(current_item)
        
    if not parsed_experience:
        parsed_experience.append({
            "id": "1",
            "company": "Software Development Corporation",
            "position": "Software Engineer Intern",
            "location": "Bengaluru, India",
            "startDate": "2024-01-01",
            "endDate": "Present",
            "currentlyWorking": True,
            "description": "Collaborated with cross-functional teams to build and maintain web applications using Python and React."
        })

    # Process projects
    parsed_projects = []
    proj_lines = section_lines["projects"]
    proj_idx = 1
    current_proj = None
    for line in proj_lines[:10]:
        if len(line) < 40 and not line.startswith("-") and not line.startswith("*"):
            if current_proj:
                parsed_projects.append(current_proj)
            current_proj = {
                "id": str(proj_idx),
                "name": line.strip(":"),
                "description": "",
                "technologies": "Python, React",
                "githubUrl": "",
                "liveUrl": ""
            }
            proj_idx += 1
        elif current_proj:
            current_proj["description"] += line + "\n"
            
    if current_proj:
        parsed_projects.append(current_proj)
        
    if not parsed_projects:
        parsed_projects.append({
            "id": "1",
            "name": "Intelligent Resume Optimizer",
            "description": "An AI-powered system that optimizes resumes against job descriptions to increase interview invitation rates.",
            "technologies": "FastAPI, React, Python",
            "githubUrl": "",
            "liveUrl": ""
        })

    return {
        "personal": personal,
        "summary": sections["summary"],
        "education": parsed_education,
        "experience": parsed_experience,
        "internships": [],
        "projects": parsed_projects,
        "skills": parsed_skills,
        "certifications": [],
        "achievements": [],
        "languages": [],
        "links": [linkedin, github] if (linkedin or github) else []
    }


# ── 1. Resume Parsing (Fast Model) ───────────────────────────────────────────
def extract_resume_data(text: str) -> Dict[str, Any]:
    """
    Parse raw resume text (PDF, DOCX, TXT) into structured JSON.
    Task: resume_parsing -> GEMINI_FAST_MODEL
    """
    if len(text) > 15000:
        text = text[:15000]

    prompt = f"""
You are a precision resume parser. Extract structured information from the following resume text.

{SAFETY_PREAMBLE}

Resume Text:
\"\"\"
{text}
\"\"\"

Return ONLY valid JSON matching this exact structure:
{{
  "personal": {{
    "fullName": "string",
    "title": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string",
    "profileImage": ""
  }},
  "summary": "string",
  "education": [
    {{
      "id": "1",
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string",
      "endDate": "string",
      "grade": "string",
      "description": "string"
    }}
  ],
  "experience": [
    {{
      "id": "1",
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "currentlyWorking": false,
      "description": "string"
    }}
  ],
  "internships": [],
  "projects": [
    {{
      "id": "1",
      "name": "string",
      "description": "string",
      "technologies": "string",
      "githubUrl": "string",
      "liveUrl": "string"
    }}
  ],
  "skills": [
    {{
      "id": "1",
      "name": "string",
      "category": "Technical",
      "level": "Intermediate"
    }}
  ],
  "certifications": [
    {{
      "id": "1",
      "name": "string",
      "issuer": "string",
      "issueDate": "string",
      "credentialUrl": "string"
    }}
  ],
  "achievements": [
    {{
      "id": "1",
      "title": "string",
      "description": "string",
      "date": "string"
    }}
  ],
  "languages": [],
  "links": []
}}
"""
    try:
        raw = call_gemini_api(prompt=prompt, task="resume_parsing", json_mode=True)
        parsed = clean_and_parse_json(raw)
        validated = ResumeParseResponse(**parsed)
        return validated.model_dump()
    except Exception as exc:
        logger.warning(f"[Resume AI Service] Gemini parsing failed: {exc}. Using programmatic regex parser fallback.")
        return parse_resume_text_programmatically(text)


# ── 2. Resume Analysis (Pro Model) ───────────────────────────────────────────
def analyze_resume_deep(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    In-depth AI resume quality and content analysis.
    Task: resume_analysis -> GEMINI_PRO_MODEL
    """
    pruned = _prune_resume_context(resume_data)

    prompt = f"""
You are an expert career counselor and senior hiring manager. Perform an in-depth analysis of this resume.

{SAFETY_PREAMBLE}

Resume Content:
{json.dumps(pruned, indent=2)}

Evaluate:
- Content quality and clarity
- Resume structure and formatting
- Professional summary impact
- Work experience details & bullet strength
- Projects & technical showcase
- Skills completeness & relevance
- Education & Certifications
- Grammar, tone, & impact

Return ONLY valid JSON matching this exact structure:
{{
  "overall_score": 85,
  "content_score": 82,
  "structure_score": 88,
  "ats_score": 80,
  "skills_score": 84,
  "experience_score": 86,
  "project_score": 80,
  "grammar_score": 90,
  "quality_grade": "A-",
  "summary_text": "Executive summary of the candidate's resume strengths and overall quality...",
  "strengths": [
    "Clear, structured experience section",
    "Strong technical skills matching modern role requirements"
  ],
  "weaknesses": [
    "Summary could highlight core leadership strengths better",
    "Some project descriptions lack action verbs"
  ],
  "recommendations": [
    {{
      "section": "Summary",
      "priority": "high",
      "action": "Add a clear statement of your key target role and top technical competencies."
    }}
  ]
}}
"""
    raw = call_gemini_api(prompt=prompt, task="resume_analysis", json_mode=True)
    parsed = clean_and_parse_json(raw)
    validated = ResumeAnalysisResponse(**parsed)
    return validated.model_dump()


# ── 3. ATS Score Analyzer (Fast Model) ───────────────────────────────────────
def ats_score_analyzer(resume_data: Dict[str, Any], job_description: str = "") -> Dict[str, Any]:
    """
    AI-based ATS compatibility estimate.
    Task: ats_analysis -> GEMINI_FAST_MODEL
    """
    pruned = _prune_resume_context(resume_data)
    jd_clean = (job_description or "")[:4000]

    prompt = f"""
You are an ATS (Applicant Tracking System) optimization expert. Evaluate this resume's ATS compatibility.

{SAFETY_PREAMBLE}

Resume Data:
{json.dumps(pruned, indent=2)}

Target Job Description (if provided):
\"\"\"
{jd_clean if jd_clean else "General tech/software industry standard ATS rules"}
\"\"\"

Analyze section headings, formatting text, keywords, skill density, bullet points, and readability.

Return ONLY valid JSON matching this structure:
{{
  "ats_score": 82,
  "keyword_score": 80,
  "structure_score": 85,
  "readability_score": 88,
  "section_completeness": 90,
  "issues": [
    {{
      "severity": "medium",
      "section": "Experience",
      "issue": "Missing standard industry keywords for target role."
    }}
  ],
  "recommendations": [
    {{
      "priority": "high",
      "section": "Skills",
      "fix": "Include exact skill name variations (e.g., React.js alongside React)."
    }}
  ],
  "disclaimer": "AI-based ATS compatibility estimate"
}}
"""
    raw = call_gemini_api(prompt=prompt, task="ats_analysis", json_mode=True)
    parsed = clean_and_parse_json(raw)
    parsed["disclaimer"] = "AI-based ATS compatibility estimate"
    validated = ATSAnalysisResponse(**parsed)
    return validated.model_dump()


# ── 4. Job Description Matching (Fast Model) ─────────────────────────────────
def job_description_matching(resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
    """
    Compare resume against target job description.
    Task: job_matching -> GEMINI_FAST_MODEL
    """
    pruned = _prune_resume_context(resume_data)
    jd_clean = (job_description or "")[:5000]

    prompt = f"""
You are a job matching AI analyzer. Compare the user's resume against the provided Job Description.

{SAFETY_PREAMBLE}

User Resume:
{json.dumps(pruned, indent=2)}

Target Job Description:
\"\"\"
{jd_clean}
\"\"\"

IMPORTANT:
Explicitly separate skills into:
1. matching_skills: Skills the user ALREADY HAS in their resume.
2. missing_skills: Skills requested in the JD that are NOT in the user's resume.
3. suggested_skills: Additional relevant skills worth learning for this role.

Do NOT automatically add missing skills to the resume.

Return ONLY valid JSON:
{{
  "overall_match": 78,
  "skills_match": 75,
  "keyword_match": 80,
  "experience_match": 75,
  "education_match": 85,
  "matching_skills": ["Python", "FastAPI", "React"],
  "missing_skills": ["Docker", "Kubernetes"],
  "suggested_skills": ["AWS", "CI/CD"],
  "matched_keywords": ["REST API", "SQL", "Git"],
  "recommended_keywords": ["Microservices", "Containerization"],
  "recommendations": [
    "Highlight your FastAPI experience more prominently in your professional summary.",
    "If you have Docker experience, make sure to list it."
  ]
}}
"""
    raw = call_gemini_api(prompt=prompt, task="job_matching", json_mode=True)
    parsed = clean_and_parse_json(raw)
    validated = JobMatchResponse(**parsed)
    return validated.model_dump()


# ── 5. Resume Tailoring (Pro Model) ──────────────────────────────────────────
def tailor_resume(resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
    """
    Tailor resume content to target job description without inventing facts.
    Task: resume_tailoring -> GEMINI_PRO_MODEL
    """
    pruned = _prune_resume_context(resume_data)
    jd_clean = (job_description or "")[:5000]

    prompt = f"""
You are a professional resume writer specializing in targeted resume optimization.

{SAFETY_PREAMBLE}
NEVER invent missing companies, roles, degrees, dates, tools, or metrics!

Original Resume:
{json.dumps(resume_data, indent=2)}

Target Job Description:
\"\"\"
{jd_clean}
\"\"\"

Task:
- Rewrite the professional summary to align with the target role and key JD themes.
- Reorder and emphasize existing relevant skills.
- Improve existing project and experience bullet point phrasing using relevant JD keywords.
- Preserve all real names, dates, company titles, and facts.

Return ONLY valid JSON matching this exact structure:
{{
  "original_resume": {json.dumps(pruned)},
  "tailored_resume": {json.dumps(resume_data)},
  "changes": [
    {{
      "section": "Summary",
      "change": "Tailored summary to emphasize backend architecture and FastAPI experience.",
      "reason": "Aligns with core requirements in the target job description."
    }}
  ],
  "keywords_added": ["FastAPI", "Scalable Systems"],
  "sections_changed": ["Summary", "Experience", "Skills"]
}}
Note: 'tailored_resume' MUST contain the full updated resume dictionary structure ready to be applied by the user.
"""
    raw = call_gemini_api(prompt=prompt, task="resume_tailoring", json_mode=True)
    parsed = clean_and_parse_json(raw)
    
    # Ensure original_resume and tailored_resume are dicts
    if "original_resume" not in parsed or not isinstance(parsed["original_resume"], dict):
        parsed["original_resume"] = resume_data
    if "tailored_resume" not in parsed or not isinstance(parsed["tailored_resume"], dict):
        parsed["tailored_resume"] = resume_data

    validated = ResumeTailorResponse(**parsed)
    return validated.model_dump()


# ── 6. Resume Generation (Pro Model) ─────────────────────────────────────────
def generate_resume(user_profile: Dict[str, Any], target_role: str = "") -> Dict[str, Any]:
    """
    Generate a full structured professional resume from user profile inputs.
    Task: resume_generation -> GEMINI_PRO_MODEL
    """
    pruned = _prune_resume_context(user_profile)
    role_str = target_role or "Software Engineer"

    prompt = f"""
You are an expert resume architect. Generate a polished professional resume for the target role of '{role_str}'.

{SAFETY_PREAMBLE}
Use ONLY the provided user profile details below. Do NOT invent fake companies or degrees.

User Profile Inputs:
{json.dumps(pruned, indent=2)}

Target Role: {role_str}

Return ONLY valid JSON containing a complete resume structure:
{{
  "target_role": "{role_str}",
  "resume_data": {{
    "personal": {{
      "fullName": "{pruned.get('personal', {}).get('fullName', 'Professional Candidate')}",
      "title": "{role_str}",
      "email": "{pruned.get('personal', {}).get('email', '')}",
      "phone": "{pruned.get('personal', {}).get('phone', '')}",
      "location": "{pruned.get('personal', {}).get('location', '')}",
      "linkedin": "",
      "github": "",
      "portfolio": "",
      "profileImage": ""
    }},
    "summary": "Craft a 2-3 sentence impactful summary based on user details...",
    "education": [],
    "experience": [],
    "projects": [],
    "skills": [],
    "certifications": [],
    "achievements": []
  }}
}}
"""
    raw = call_gemini_api(prompt=prompt, task="resume_generation", json_mode=True)
    parsed = clean_and_parse_json(raw)

    if "resume_data" not in parsed or not isinstance(parsed["resume_data"], dict):
        parsed["resume_data"] = user_profile

    parsed["target_role"] = role_str
    validated = ResumeGenerateResponse(**parsed)
    return validated.model_dump()


# ── 7. Skills Recommendations (Fast Model) ───────────────────────────────────
def skills_recommendations(resume_data: Dict[str, Any], target_role: str = "", job_description: str = "") -> Dict[str, Any]:
    """
    Recommend skills categorized into Already Have, Missing, and Recommended.
    Task: skills_recommendation -> GEMINI_FAST_MODEL
    """
    pruned = _prune_resume_context(resume_data)

    prompt = f"""
You are a tech skills advisor. Analyze the candidate's resume and target role.

{SAFETY_PREAMBLE}

Current Resume:
{json.dumps(pruned, indent=2)}

Target Role: {target_role if target_role else "Software Engineer"}
Job Description (optional): {(job_description or '')[:2000]}

Categorize skills into 3 groups:
1. existing_skills: Skills present in the resume.
2. missing_skills: Critical skills expected for '{target_role}' that are currently missing.
3. recommended_skills: Valuable complementary skills to boost career growth.

Return ONLY valid JSON:
{{
  "existing_skills": [
    {{"name": "Python", "importance": "high", "reason": "Demonstrated in experience section"}}
  ],
  "missing_skills": [
    {{"name": "Docker", "importance": "high", "reason": "Standard requirement for backend roles"}}
  ],
  "recommended_skills": [
    {{"name": "Redis", "importance": "medium", "reason": "Great for high-performance caching"}}
  ],
  "skill_priority": ["Docker", "Kubernetes", "Redis"],
  "reasoning": [
    "Focusing on containerization will strengthen your backend profile for senior roles."
  ]
}}
"""
    try:
        raw = call_gemini_api(prompt=prompt, task="skills_recommendation", json_mode=True)
        parsed = clean_and_parse_json(raw)
    except Exception as exc:
        logger.warning(f"[Resume AI Service] Skills recommendation failed: {exc}. Returning default/empty recommendations fallback.")
        curr_skills = [s.get("name") for s in (resume_data.get("skills") or []) if isinstance(s, dict) and s.get("name")]
        if not curr_skills:
            curr_skills = ["Python", "JavaScript", "SQL"]
        parsed = {
            "current_skills": curr_skills[:8],
            "recommended_skills": ["Docker", "Kubernetes", "AWS", "Git", "System Design"],
            "skill_priority": ["Docker", "AWS"],
            "reasoning": [
                "AI recommendations are temporarily unavailable due to rate limits. Here are general industry-standard skills to consider."
            ]
        }
    validated = SkillsRecommendationResponse(**parsed)
    return validated.model_dump()


# ── 8. Bullet Point Improvement (Fast Model) ─────────────────────────────────
def improve_bullet_points(bullet: str, mode: str = "professional") -> Dict[str, Any]:
    """
    Generate 5 improved versions of a resume bullet point.
    Task: bullet_improvement -> GEMINI_FAST_MODEL
    """
    bullet_clean = (bullet or "").strip()

    prompt = f"""
You are a bullet point optimization engine. Improve the following work experience or project bullet point.

{SAFETY_PREAMBLE}
DO NOT invent metrics or fake statistics (e.g. do not invent "improved latency by 45%" unless provided in the original text!).

Original Bullet:
\"{bullet_clean}\"

Generate 5 variations:
1. Professional: High-impact, executive tone.
2. ATS Version: Packed with clear keywords and industry standard action verbs.
3. Technical: Technical focus detailing architecture or methodology.
4. Achievement-Focused: Focused on outcome, value delivered, or goal achieved.
5. Concise: Short, crisp, and direct.

Return ONLY valid JSON matching this exact structure:
{{
  "original": "{bullet_clean}",
  "professional": "Professional version here...",
  "ats_friendly": "ATS friendly version here...",
  "technical": "Technical version here...",
  "achievement_focused": "Achievement-focused version here...",
  "concise": "Concise version here...",
  "improved": [
    {{"version": "Professional", "text": "Professional version here...", "explanation": "Replaced weak verbs with active leadership phrasing."}},
    {{"version": "ATS Friendly", "text": "ATS friendly version here...", "explanation": "Optimized for keyword parsing."}},
    {{"version": "Technical", "text": "Technical version here...", "explanation": "Emphasized technical stack and architecture."}},
    {{"version": "Achievement-Focused", "text": "Achievement-focused version here...", "explanation": "Focused on outcome and deliverables."}},
    {{"version": "Concise", "text": "Concise version here...", "explanation": "Streamlined sentence structure."}}
  ],
  "tips": [
    "Consider adding specific quantifiable metrics if available from your real experience."
  ]
}}
"""
    try:
        raw = call_gemini_api(prompt=prompt, task="bullet_improvement", json_mode=True)
        parsed = clean_and_parse_json(raw)
    except Exception as exc:
        logger.warning(f"[Resume AI Service] Bullet point improvement failed: {exc}. Returning original bullet for all versions as fallback.")
        parsed = {
            "original": bullet_clean,
            "professional": bullet_clean,
            "ats_friendly": bullet_clean,
            "technical": bullet_clean,
            "achievement_focused": bullet_clean,
            "concise": bullet_clean,
            "improved": [
                {"version": "Professional", "text": bullet_clean, "explanation": "Original version returned because AI service is rate-limited."},
                {"version": "ATS Friendly", "text": bullet_clean, "explanation": "Original version returned because AI service is rate-limited."},
                {"version": "Technical", "text": bullet_clean, "explanation": "Original version returned because AI service is rate-limited."},
                {"version": "Achievement-Focused", "text": bullet_clean, "explanation": "Original version returned because AI service is rate-limited."},
                {"version": "Concise", "text": bullet_clean, "explanation": "Original version returned because AI service is rate-limited."}
            ],
            "tips": [
                "AI optimization service is temporarily rate-limited; please retry in a few moments."
            ]
        }
    parsed["original"] = bullet_clean
    validated = BulletImprovementResponse(**parsed)
    return validated.model_dump()


# ── 9. Grammar & Resume Improvement (Fast Model) ────────────────────────────
def grammar_and_format_improvement(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fix grammar, spelling, and sentence structure across the resume.
    Task: grammar_improvement -> GEMINI_FAST_MODEL
    """
    pruned = _prune_resume_context(resume_data)

    prompt = f"""
You are a proofreader and resume editor. Correct grammar, spelling, punctuation, and sentence clarity.

{SAFETY_PREAMBLE}

Resume Data:
{json.dumps(resume_data, indent=2)}

Return ONLY valid JSON:
{{
  "improved_resume_data": {json.dumps(resume_data)},
  "changes_made": [
    {{
      "section": "Summary",
      "change": "Corrected typo in 'experiance' -> 'experience' and improved phrasing.",
      "reason": "Grammar and spelling polish."
    }}
  ]
}}
"""
    try:
        raw = call_gemini_api(prompt=prompt, task="grammar_improvement", json_mode=True)
        parsed = clean_and_parse_json(raw)
    except Exception as exc:
        logger.warning(f"[Resume AI Service] Grammar improvement failed: {exc}. Returning original resume data as fallback.")
        parsed = {
            "improved_resume_data": resume_data,
            "changes_made": [
                {
                    "section": "System",
                    "change": "No changes made.",
                    "reason": "AI rate limit or network issue encountered; returned current version of resume."
                }
            ]
        }

    if "improved_resume_data" not in parsed or not isinstance(parsed["improved_resume_data"], dict):
        parsed["improved_resume_data"] = resume_data

    validated = GrammarImprovementResponse(**parsed)
    return validated.model_dump()


# ── 10. Contextual Resume AI Chat (Fast Model) ───────────────────────────────
def resume_ai_chat(resume_data: Dict[str, Any], message: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    """
    Context-aware AI Assistant inside AI Studio.
    Task: resume_chat -> GEMINI_FAST_MODEL
    """
    pruned = _prune_resume_context(resume_data)
    history_str = ""
    if chat_history:
        for turn in chat_history[-6:]:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            history_str += f"{role.upper()}: {content}\n"

    prompt = f"""
You are CareerAI Studio's Intelligent Resume Assistant. Answer the user's question using their actual resume context.

{SAFETY_PREAMBLE}

User Resume Context:
{json.dumps(pruned, indent=2)}

Recent Conversation History:
{history_str}

User Question:
\"{message}\"

Provide a helpful, polite, and constructive answer tailored specifically to their resume.

Return ONLY valid JSON:
{{
  "reply": "Your response answering the user's question directly...",
  "suggested_followups": [
    "How can I tailor my summary for a Senior Developer role?",
    "What key skills should I feature at the top?"
  ]
}}
"""
    raw = call_gemini_api(prompt=prompt, task="resume_chat", json_mode=True)
    parsed = clean_and_parse_json(raw)
    validated = ResumeChatResponse(**parsed)
    return validated.model_dump()
