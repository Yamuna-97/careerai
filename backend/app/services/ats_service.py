"""
app/services/ats_service.py
────────────────────────────
ATS (Applicant Tracking System) resume scoring service.

Implements a rule-based scoring system that can be enhanced with AI later.
Scoring is modular — each check is a separate function.
"""

from dataclasses import dataclass, field
from app.models.resume import Resume


@dataclass
class ATSResult:
    score: int
    strengths: list[str] = field(default_factory=list)
    weaknesses: list[str] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)


def score_resume(resume: Resume) -> ATSResult:
    """
    Analyse a resume and return an ATS score (0-100) with feedback.
    The scoring is modular — each category contributes to the final score.
    """
    strengths = []
    weaknesses = []
    suggestions = []
    total_score = 0

    # ── 1. Contact Information (20 points) ────────────────────────────
    contact_score = 0
    if resume.full_name:
        contact_score += 5
    if resume.email:
        contact_score += 5
    if resume.phone:
        contact_score += 5
    if resume.location:
        contact_score += 3
    if resume.linkedin or resume.github:
        contact_score += 2

    total_score += contact_score
    if contact_score >= 15:
        strengths.append("Contact information is complete.")
    else:
        weaknesses.append("Contact information is incomplete.")
        if not resume.email:
            suggestions.append("Add your email address.")
        if not resume.phone:
            suggestions.append("Add your phone number.")
        if not resume.linkedin:
            suggestions.append("Add your LinkedIn profile URL.")

    # ── 2. Summary / Objective (15 points) ────────────────────────────
    if resume.summary and len(resume.summary) > 50:
        total_score += 15
        strengths.append("Professional summary is present and detailed.")
    elif resume.summary:
        total_score += 8
        weaknesses.append("Summary is too brief.")
        suggestions.append("Expand your summary to at least 2-3 sentences describing your goals and key strengths.")
    else:
        weaknesses.append("No professional summary found.")
        suggestions.append("Add a compelling 2-3 sentence professional summary highlighting your goals.")

    # ── 3. Education (15 points) ──────────────────────────────────────
    if resume.education:
        total_score += 15
        strengths.append(f"Education section has {len(resume.education)} entry(ies).")
    else:
        weaknesses.append("No education entries found.")
        suggestions.append("Add at least one education entry (degree, institution, graduation year).")

    # ── 4. Experience (20 points) ─────────────────────────────────────
    exp_score = 0
    if resume.experience:
        exp_score = min(20, len(resume.experience) * 10)
        # Bonus for descriptions
        with_desc = sum(1 for e in resume.experience if e.description and len(e.description) > 50)
        if with_desc == len(resume.experience):
            strengths.append("All experience entries have detailed descriptions.")
        elif with_desc > 0:
            suggestions.append("Add detailed bullet-point descriptions to all experience entries.")
        else:
            weaknesses.append("Experience entries lack descriptions.")
            suggestions.append("Add 2-4 achievement-focused bullet points to each experience entry.")
    else:
        suggestions.append("Add work experience, internships, or relevant roles.")

    total_score += exp_score

    # ── 5. Projects (10 points) ───────────────────────────────────────
    if resume.projects:
        total_score += min(10, len(resume.projects) * 5)
        strengths.append(f"Projects section has {len(resume.projects)} project(s).")
    else:
        suggestions.append("Add relevant projects to showcase your practical skills.")

    # ── 6. Skills (15 points) ─────────────────────────────────────────
    if resume.skills:
        skill_score = min(15, len(resume.skills) * 2)
        total_score += skill_score
        if len(resume.skills) >= 5:
            strengths.append(f"Skills section lists {len(resume.skills)} skills.")
        else:
            weaknesses.append("Skills section is too short.")
            suggestions.append("Add at least 8-10 relevant technical and soft skills.")
    else:
        weaknesses.append("No skills listed.")
        suggestions.append("Add a skills section with programming languages, frameworks, and tools.")

    # ── 7. Certifications (5 points) ──────────────────────────────────
    if resume.certifications:
        total_score += 5
        strengths.append("Certifications section is present.")
    else:
        suggestions.append("Add relevant certifications to strengthen your profile.")

    # Cap score at 100
    final_score = min(100, total_score)

    return ATSResult(
        score=final_score,
        strengths=strengths,
        weaknesses=weaknesses,
        suggestions=suggestions,
    )
