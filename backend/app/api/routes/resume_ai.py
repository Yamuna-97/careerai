"""
app/api/routes/resume_ai.py
────────────────────────────
AI-powered resume endpoints: extraction, generation, improvement,
ATS optimization, chat editing, version management, and file upload.
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services import resume_ai_service

router = APIRouter()


# ── Request/Response Schemas ───────────────────────────────────────────────────

class ExtractTextRequest(BaseModel):
    text: str


class GenerateResumeRequest(BaseModel):
    resume_data: dict
    target_role: Optional[str] = ""
    job_description: Optional[str] = ""
    tone: Optional[str] = "Professional"


class ImproveResumeRequest(BaseModel):
    resume_data: dict


class EditSectionRequest(BaseModel):
    section: str
    content: object
    instruction: str
    resume_context: dict


class ATSRequest(BaseModel):
    resume_data: dict
    job_description: Optional[str] = ""


class AnalyzeJobRequest(BaseModel):
    job_description: str


class ChatRequest(BaseModel):
    message: str
    resume_data: dict
    chat_history: Optional[List[dict]] = []
    selected_section: Optional[str] = None


class ScoreRequest(BaseModel):
    resume_data: dict
    target_role: Optional[str] = ""


class SuggestionsRequest(BaseModel):
    resume_data: dict


class VersionSaveRequest(BaseModel):
    resume_data: dict
    version_label: str
    user_id: Optional[str] = "local"


class VersionRestoreRequest(BaseModel):
    version_index: int
    user_id: Optional[str] = "local"


class ApplyRequest(BaseModel):
    resume_data: dict


# ── In-memory version store (per session — use DB for production) ──────────────
_version_store: dict[str, list] = {}


def _get_user_id(current_user_id: str = Depends(get_current_user_id)) -> str:
    return current_user_id


# ── Helper to return graceful fallback when AI key is missing ─────────────────
def _ai_unavailable_response(feature: str):
    return JSONResponse(
        status_code=200,
        content={
            "success": False,
            "error": "ai_not_configured",
            "message": f"AI feature '{feature}' requires GEMINI_API_KEY in .env. "
                       "Set AI_PROVIDER=gemini and add your GEMINI_API_KEY to enable this feature.",
            "demo_mode": True
        }
    )


# ── 1. Extract from Uploaded File ─────────────────────────────────────────────
@router.post("/upload", summary="Upload PDF or DOCX and extract resume data")
async def upload_resume_file(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Upload a PDF or DOCX resume file.
    Extracts text and returns structured resume data.
    """
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        return _ai_unavailable_response("file-upload-extract")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    filename_lower = file.filename.lower()
    file_bytes = await file.read()

    try:
        if filename_lower.endswith(".pdf"):
            text = resume_ai_service.extract_text_from_pdf(file_bytes)
        elif filename_lower.endswith(".docx") or filename_lower.endswith(".doc"):
            text = resume_ai_service.extract_text_from_docx(file_bytes)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload a PDF or DOCX file."
            )

        if not text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from the uploaded file.")

        extracted = resume_ai_service.extract_resume_data(text)
        return {"success": True, "extracted_text": text[:500], "resume_data": extracted}

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


# ── 2. Extract from Pasted Text ────────────────────────────────────────────────
@router.post("/extract", summary="Extract resume data from pasted text")
def extract_from_text(
    request: ExtractTextRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Parse pasted resume text into structured CareerAI resume schema."""
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        return _ai_unavailable_response("extract")

    if len(request.text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Text is too short to extract resume data.")

    try:
        extracted = resume_ai_service.extract_resume_data(request.text)
        return {"success": True, "resume_data": extracted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


# ── 3. Generate Polished Resume ────────────────────────────────────────────────
@router.post("/generate", summary="Generate AI-improved resume from structured data")
def generate_resume(
    request: GenerateResumeRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Take structured resume data and return an AI-improved version.
    Tailored to target role and optionally to job description.
    """
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        return _ai_unavailable_response("generate")

    try:
        improved = resume_ai_service.generate_resume(
            data=request.resume_data,
            target_role=request.target_role or "",
            job_description=request.job_description or "",
            tone=request.tone or "Professional"
        )
        return {"success": True, "resume_data": improved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


# ── 4. Improve Existing Resume ─────────────────────────────────────────────────
@router.post("/improve", summary="General AI improvement pass on full resume")
def improve_resume(
    request: ImproveResumeRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Apply a general improvement pass: wording, grammar, impact verbs."""
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        return _ai_unavailable_response("improve")

    try:
        improved = resume_ai_service.improve_resume(request.resume_data)
        return {"success": True, "resume_data": improved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Improvement failed: {str(e)}")


# ── 5. Edit a Specific Section ─────────────────────────────────────────────────
@router.post("/edit", summary="Edit a specific resume section with AI instruction")
def edit_section(
    request: EditSectionRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Apply a specific natural language instruction to one section."""
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        return _ai_unavailable_response("edit-section")

    try:
        updated = resume_ai_service.rewrite_section(
            section=request.section,
            content=request.content,
            instruction=request.instruction,
            context=request.resume_context
        )
        return {"success": True, "section": request.section, "updated_content": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Section edit failed: {str(e)}")


# ── 6. ATS Optimization ────────────────────────────────────────────────────────
@router.post("/ats", summary="Analyze resume for ATS compatibility")
def ats_optimization(
    request: ATSRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Score resume for ATS compatibility and return keyword analysis."""
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        return _ai_unavailable_response("ats")

    try:
        result = resume_ai_service.optimize_for_ats(
            data=request.resume_data,
            job_description=request.job_description or ""
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS analysis failed: {str(e)}")


# ── 7. Analyze Job Description ────────────────────────────────────────────────
@router.post("/analyze-job", summary="Extract key requirements from a job description")
def analyze_job(
    request: AnalyzeJobRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Parse a job description into structured requirements."""
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        return _ai_unavailable_response("analyze-job")

    try:
        result = resume_ai_service.analyze_job_description(request.job_description)
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job analysis failed: {str(e)}")


# ── 8. Chat Edit ───────────────────────────────────────────────────────────────
@router.post("/chat", summary="Chat-based resume editing with natural language")
def chat_edit(
    request: ChatRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Process a natural language editing command and return updated resume.
    Maintains conversation context via chat_history.
    """
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        return _ai_unavailable_response("chat")

    try:
        result = resume_ai_service.chat_edit_resume(
            message=request.message,
            resume_data=request.resume_data,
            chat_history=request.chat_history or [],
            selected_section=request.selected_section
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat edit failed: {str(e)}")


# ── 9. Score Resume ────────────────────────────────────────────────────────────
@router.post("/score", summary="Get multi-dimensional resume scores")
def score_resume(
    request: ScoreRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Score the resume across: Overall, ATS, Content, Impact, Readability, Professionalism."""
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        # Return demo scores when AI is not configured
        return {
            "success": True,
            "demo_mode": True,
            "overall_score": 72,
            "ats_score": 68,
            "content_score": 75,
            "impact_score": 65,
            "readability_score": 80,
            "professionalism_score": 74,
            "keyword_match_score": 60,
            "summary": "Good foundation — needs stronger action verbs and quantified achievements.",
            "top_strengths": ["Clear formatting", "Relevant skills listed", "Education details complete"],
            "improvement_areas": ["Professional summary", "Experience impact descriptions"]
        }

    try:
        result = resume_ai_service.score_resume(
            data=request.resume_data,
            target_role=request.target_role or ""
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


# ── 10. Generate Suggestions ───────────────────────────────────────────────────
@router.post("/suggestions", summary="Get improvement suggestions for the resume")
def get_suggestions(
    request: SuggestionsRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Return prioritized list of actionable improvement suggestions."""
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        return {
            "success": True,
            "demo_mode": True,
            "suggestions": [
                {"id": "1", "section": "summary", "priority": "high", "issue": "Summary is too generic", "suggestion": "Add specific technologies and quantified impact", "fix_prompt": "Rewrite summary with specific technologies and measurable achievements"},
                {"id": "2", "section": "experience", "priority": "high", "issue": "Descriptions lack impact", "suggestion": "Start each bullet with a strong action verb", "fix_prompt": "Rewrite experience descriptions using strong action verbs and quantified results"},
                {"id": "3", "section": "projects", "priority": "medium", "issue": "Missing technical detail", "suggestion": "Describe the problem solved and technical approach", "fix_prompt": "Improve project descriptions to highlight technical challenges and solutions"},
                {"id": "4", "section": "skills", "priority": "low", "issue": "Skills not categorized", "suggestion": "Group skills by category for better readability", "fix_prompt": "Reorganize skills into clear categories"},
            ]
        }

    try:
        suggestions = resume_ai_service.generate_resume_suggestions(request.resume_data)
        return {"success": True, "suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestions failed: {str(e)}")


# ── 11. Save Version ───────────────────────────────────────────────────────────
@router.post("/version", summary="Save a named version of the resume")
def save_version(
    request: VersionSaveRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Save the current resume state as a named version for restore later."""
    user_key = current_user_id
    if user_key not in _version_store:
        _version_store[user_key] = []

    _version_store[user_key].append({
        "label": request.version_label,
        "resume_data": request.resume_data,
        "created_at": __import__("datetime").datetime.utcnow().isoformat()
    })

    return {
        "success": True,
        "version_index": len(_version_store[user_key]) - 1,
        "total_versions": len(_version_store[user_key])
    }


# ── 12. Get Versions ───────────────────────────────────────────────────────────
@router.get("/versions", summary="List all saved resume versions")
def get_versions(current_user_id: str = Depends(get_current_user_id)):
    """Return all saved versions for the current user (without full data)."""
    user_key = current_user_id
    versions = _version_store.get(user_key, [])
    return {
        "success": True,
        "versions": [
            {"index": i, "label": v["label"], "created_at": v["created_at"]}
            for i, v in enumerate(versions)
        ]
    }


# ── 13. Restore Version ────────────────────────────────────────────────────────
@router.post("/restore", summary="Restore a saved version of the resume")
def restore_version(
    request: VersionRestoreRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """Restore a previously saved resume version by index."""
    user_key = current_user_id
    versions = _version_store.get(user_key, [])

    if request.version_index < 0 or request.version_index >= len(versions):
        raise HTTPException(status_code=404, detail="Version not found.")

    version = versions[request.version_index]
    return {"success": True, "resume_data": version["resume_data"], "label": version["label"]}


# ── 14. Apply to Builder ───────────────────────────────────────────────────────
@router.post("/apply", summary="Apply AI-generated resume to the manual builder")
def apply_to_builder(
    request: ApplyRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Validates the AI-generated resume data and returns it ready
    for the frontend to save to localStorage and navigate to the builder.
    """
    data = request.resume_data

    # Basic validation
    required_keys = ["personal", "summary", "education", "experience", "projects", "skills"]
    for key in required_keys:
        if key not in data:
            data[key] = [] if key != "personal" and key != "summary" else ({} if key == "personal" else "")

    return {"success": True, "resume_data": data, "redirect_to": "/resume/builder"}
