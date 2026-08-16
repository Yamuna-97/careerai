"""
app/api/routes/resume_ai.py
────────────────────────────
FastAPI router for AI Studio endpoints.
Includes model routing, prompt execution, Pydantic response validation,
and graceful error handling.
"""

import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.services import resume_ai_service, pdf_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request Schemas ────────────────────────────────────────────────────────────
class ExtractTextRequest(BaseModel):
    text: str

class AnalyzeRequest(BaseModel):
    resume_data: Dict[str, Any]

class ATSRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: Optional[str] = ""

class JobMatchRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: str

class TailorRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: str

class GenerateRequest(BaseModel):
    resume_data: Optional[Dict[str, Any]] = None
    target_role: Optional[str] = "Software Engineer"
    user_profile: Optional[Dict[str, Any]] = None

class SkillsRequest(BaseModel):
    resume_data: Dict[str, Any]
    target_role: Optional[str] = ""
    job_description: Optional[str] = ""

class BulletRequest(BaseModel):
    bullet: str
    mode: Optional[str] = "professional"

class ImproveRequest(BaseModel):
    resume_data: Dict[str, Any]

class ChatRequest(BaseModel):
    message: str
    resume_data: Dict[str, Any]
    chat_history: Optional[List[Dict[str, Any]]] = []


# ── Helper for Error Handling ──────────────────────────────────────────────────
def _handle_ai_exception(feature: str, exc: Exception):
    logger.error(f"[AI Studio Route Error] Task='{feature}': {exc}", exc_info=True)
    if "GEMINI_API_KEY" in str(exc):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "gemini_api_key_missing",
                "message": "AI service is not configured. Please set GEMINI_API_KEY in backend .env file.",
            }
        )
    raise HTTPException(
        status_code=500,
        detail="AI service is temporarily unavailable. Please try again later."
    )


# ── 1. Resume Parsing / Upload Endpoints ─────────────────────────────────────
@router.post("/parse-resume")
@router.post("/extract-text")
def parse_resume_text(req: ExtractTextRequest):
    try:
        data = resume_ai_service.extract_resume_data(req.text)
        return {"success": True, "resume_data": data}
    except Exception as e:
        return _handle_ai_exception("parse_resume", e)

@router.post("/upload")
async def upload_and_parse_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        filename = file.filename.lower()
        extracted_text = ""
        
        if filename.endswith(".pdf"):
            extracted_text = pdf_service.extract_text_from_pdf(content)
        elif filename.endswith(".docx") or filename.endswith(".doc"):
            extracted_text = pdf_service.extract_text_from_docx(content)
        elif filename.endswith(".txt"):
            extracted_text = content.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, DOC, or TXT.")

        if not extracted_text.strip():
            # Emergency raw decode fallback
            extracted_text = content.decode("latin1", errors="ignore")
            # Strip non-printable ascii
            import re
            extracted_text = re.sub(r'[^\x20-\x7E\n\r\t]', ' ', extracted_text)
            extracted_text = " ".join(extracted_text.split())

        if not extracted_text.strip() or len(extracted_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Could not extract readable text from file. Please make sure the file contains selectable text.")

        data = resume_ai_service.extract_resume_data(extracted_text)
        return {"success": True, "filename": file.filename, "resume_data": data}
    except HTTPException:
        raise
    except Exception as e:
        return _handle_ai_exception("upload_and_parse", e)


# ── 2. Resume Analysis Endpoints ──────────────────────────────────────────────
@router.post("/analyze")
@router.post("/analyze-resume")
def analyze_resume(req: AnalyzeRequest):
    try:
        res = resume_ai_service.analyze_resume_deep(req.resume_data)
        return res
    except Exception as e:
        return _handle_ai_exception("analyze_resume", e)


# ── 3. ATS Score Analyzer Endpoints ───────────────────────────────────────────
@router.post("/ats")
@router.post("/ats-analysis")
def analyze_ats(req: ATSRequest):
    try:
        res = resume_ai_service.ats_score_analyzer(req.resume_data, req.job_description or "")
        return res
    except Exception as e:
        return _handle_ai_exception("ats_analysis", e)


# ── 4. Job Description Matching Endpoints ─────────────────────────────────────
@router.post("/match-job")
@router.post("/job-match")
def match_job_description(req: JobMatchRequest):
    try:
        res = resume_ai_service.job_description_matching(req.resume_data, req.job_description)
        return res
    except Exception as e:
        return _handle_ai_exception("job_matching", e)


# ── 5. Resume Tailoring Endpoints ─────────────────────────────────────────────
@router.post("/tailor")
@router.post("/tailor-resume")
def tailor_resume(req: TailorRequest):
    try:
        res = resume_ai_service.tailor_resume(req.resume_data, req.job_description)
        return res
    except Exception as e:
        return _handle_ai_exception("resume_tailoring", e)


# ── 6. Resume Generation Endpoints ────────────────────────────────────────────
@router.post("/generate")
@router.post("/generate-resume")
def generate_resume(req: GenerateRequest):
    try:
        profile = req.user_profile or req.resume_data or {}
        res = resume_ai_service.generate_resume(profile, req.target_role or "Software Engineer")
        return res
    except Exception as e:
        return _handle_ai_exception("resume_generation", e)


# ── 7. Skills Recommendations Endpoints ───────────────────────────────────────
@router.post("/skills-recommendations")
@router.post("/skills")
def recommend_skills(req: SkillsRequest):
    try:
        res = resume_ai_service.skills_recommendations(
            req.resume_data,
            target_role=req.target_role or "",
            job_description=req.job_description or "",
        )
        return res
    except Exception as e:
        return _handle_ai_exception("skills_recommendation", e)


# ── 8. Bullet Point Improvement Endpoint ──────────────────────────────────────
@router.post("/improve-bullet")
def improve_bullet(req: BulletRequest):
    try:
        res = resume_ai_service.improve_bullet_points(req.bullet, req.mode or "professional")
        return res
    except Exception as e:
        return _handle_ai_exception("bullet_improvement", e)


# ── 9. Grammar / Resume Improvement Endpoints ─────────────────────────────────
@router.post("/improve")
@router.post("/improve-resume")
def improve_resume(req: ImproveRequest):
    try:
        res = resume_ai_service.grammar_and_format_improvement(req.resume_data)
        return res
    except Exception as e:
        return _handle_ai_exception("grammar_improvement", e)


# ── 10. Contextual Resume AI Chat Endpoint ───────────────────────────────────
@router.post("/chat")
def resume_ai_chat(req: ChatRequest):
    try:
        res = resume_ai_service.resume_ai_chat(
            resume_data=req.resume_data,
            message=req.message,
            chat_history=req.chat_history or [],
        )
        return res
    except Exception as e:
        return _handle_ai_exception("resume_chat", e)
