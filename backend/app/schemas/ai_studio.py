"""
app/schemas/ai_studio.py
─────────────────────────
Pydantic schemas for AI Studio operations.
Strict response validation ensures Gemini structured JSON outputs
match the expected frontend contracts.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ── 1. Resume Parsing Schema ──────────────────────────────────────────────────
class ParsedPersonal(BaseModel):
    fullName: str = ""
    title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""
    profileImage: str = ""

class ParsedEducation(BaseModel):
    id: str = "1"
    institution: str = ""
    degree: str = ""
    fieldOfStudy: str = ""
    startDate: str = ""
    endDate: str = ""
    grade: str = ""
    description: str = ""

class ParsedExperience(BaseModel):
    id: str = "1"
    company: str = ""
    position: str = ""
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    currentlyWorking: bool = False
    description: str = ""

class ParsedProject(BaseModel):
    id: str = "1"
    name: str = ""
    description: str = ""
    technologies: str = ""
    githubUrl: str = ""
    liveUrl: str = ""

class ParsedSkill(BaseModel):
    id: str = "1"
    name: str = ""
    category: str = "Technical"
    level: str = "Intermediate"

class ParsedCertification(BaseModel):
    id: str = "1"
    name: str = ""
    issuer: str = ""
    issueDate: str = ""
    credentialUrl: str = ""

class ParsedAchievement(BaseModel):
    id: str = "1"
    title: str = ""
    description: str = ""
    date: str = ""

class ParsedLanguage(BaseModel):
    name: str = ""
    proficiency: str = ""

class ResumeParseResponse(BaseModel):
    personal: ParsedPersonal = Field(default_factory=ParsedPersonal)
    summary: str = ""
    education: List[ParsedEducation] = Field(default_factory=list)
    experience: List[ParsedExperience] = Field(default_factory=list)
    internships: List[ParsedExperience] = Field(default_factory=list)
    projects: List[ParsedProject] = Field(default_factory=list)
    skills: List[ParsedSkill] = Field(default_factory=list)
    certifications: List[ParsedCertification] = Field(default_factory=list)
    achievements: List[ParsedAchievement] = Field(default_factory=list)
    languages: List[ParsedLanguage] = Field(default_factory=list)
    links: List[str] = Field(default_factory=list)


# ── 2. Resume Analysis Schema ─────────────────────────────────────────────────
class AnalysisRecommendation(BaseModel):
    section: str = ""
    priority: str = "medium"  # "high", "medium", "low"
    action: str = ""

class ResumeAnalysisResponse(BaseModel):
    overall_score: int = 0
    content_score: int = 0
    structure_score: int = 0
    ats_score: int = 0
    skills_score: int = 0
    experience_score: int = 0
    project_score: int = 0
    grammar_score: int = 0
    quality_grade: str = "B"
    summary_text: str = ""
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[AnalysisRecommendation] = Field(default_factory=list)


# ── 3. ATS Score Analyzer Schema ──────────────────────────────────────────────
class ATSIssue(BaseModel):
    severity: str = "medium"  # "high", "medium", "low"
    section: str = ""
    issue: str = ""

class ATSRecommendation(BaseModel):
    priority: str = "medium"
    section: str = ""
    fix: str = ""

class ATSAnalysisResponse(BaseModel):
    ats_score: int = 0
    keyword_score: int = 0
    structure_score: int = 0
    readability_score: int = 0
    section_completeness: int = 0
    issues: List[ATSIssue] = Field(default_factory=list)
    recommendations: List[ATSRecommendation] = Field(default_factory=list)
    disclaimer: str = "AI-based ATS compatibility estimate"


# ── 4. Job Description Matching Schema ───────────────────────────────────────
class SkillItem(BaseModel):
    name: str = ""
    category: Optional[str] = "General"
    importance: Optional[str] = "medium"
    reason: Optional[str] = ""

class JobMatchResponse(BaseModel):
    overall_match: int = 0
    skills_match: int = 0
    keyword_match: int = 0
    experience_match: int = 0
    education_match: int = 0
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    suggested_skills: List[str] = Field(default_factory=list)
    matched_keywords: List[str] = Field(default_factory=list)
    recommended_keywords: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


# ── 5. Resume Tailoring Schema ────────────────────────────────────────────────
class TailoredSectionChange(BaseModel):
    section: str = ""
    change: str = ""
    reason: str = ""

class ResumeTailorResponse(BaseModel):
    original_resume: Dict[str, Any] = Field(default_factory=dict)
    tailored_resume: Dict[str, Any] = Field(default_factory=dict)
    changes: List[TailoredSectionChange] = Field(default_factory=list)
    keywords_added: List[str] = Field(default_factory=list)
    sections_changed: List[str] = Field(default_factory=list)


# ── 6. Resume Generation Schema ───────────────────────────────────────────────
class ResumeGenerateResponse(BaseModel):
    target_role: str = ""
    resume_data: Dict[str, Any] = Field(default_factory=dict)


# ── 7. Skills Recommendations Schema ─────────────────────────────────────────
class SkillRecommendationDetail(BaseModel):
    name: str = ""
    importance: str = "medium"  # "high", "medium", "low"
    reason: str = ""

class SkillsRecommendationResponse(BaseModel):
    existing_skills: List[SkillRecommendationDetail] = Field(default_factory=list)
    missing_skills: List[SkillRecommendationDetail] = Field(default_factory=list)
    recommended_skills: List[SkillRecommendationDetail] = Field(default_factory=list)
    skill_priority: List[str] = Field(default_factory=list)
    reasoning: List[str] = Field(default_factory=list)


# ── 8. Bullet Point Improvement Schema ────────────────────────────────────────
class BulletVersion(BaseModel):
    version: str = ""  # "Professional", "ATS", "Technical", "Achievement-Focused", "Concise"
    text: str = ""
    explanation: str = ""

class BulletImprovementResponse(BaseModel):
    original: str = ""
    professional: str = ""
    ats_friendly: str = ""
    technical: str = ""
    achievement_focused: str = ""
    concise: str = ""
    improved: List[BulletVersion] = Field(default_factory=list)
    tips: List[str] = Field(default_factory=list)


# ── 9. Grammar & Resume Improvement Schema ───────────────────────────────────
class GrammarImprovementResponse(BaseModel):
    improved_resume_data: Dict[str, Any] = Field(default_factory=dict)
    changes_made: List[TailoredSectionChange] = Field(default_factory=list)


# ── 10. Resume AI Chat Schema ─────────────────────────────────────────────────
class ResumeChatResponse(BaseModel):
    reply: str = ""
    suggested_followups: List[str] = Field(default_factory=list)
