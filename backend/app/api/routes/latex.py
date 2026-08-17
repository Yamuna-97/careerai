"""
app/api/routes/latex.py
────────────────────────
FastAPI endpoints for Overleaf-style LaTeX Resume Editor and Template Compilation.
Supports compilation sandbox, official templates (1-9), data binding, AI editing, and project storage.
"""

import base64
import uuid
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.services import latex_compile_service, latex_ai_service, latex_template_service

router = APIRouter()


# ── Request / Response Schemas ─────────────────────────────────────────────────

class CompileRequest(BaseModel):
    files: Dict[str, str]  # filename -> code string (or Base64 binary)
    compiler: Optional[str] = "pdflatex"


class RenderTemplateRequest(BaseModel):
    resume_data: Dict[str, Any]
    compiler: Optional[str] = "pdflatex"


class GenerateRequest(BaseModel):
    resume_data: dict


class ImportRequest(BaseModel):
    latex_code: str


class AIEditRequest(BaseModel):
    latex_code: str
    instruction: str


class AIFixRequest(BaseModel):
    latex_code: str
    error_message: str
    line_number: int


from app.core.security import get_current_user_id


# ── Endpoints ──────────────────────────────────────────────────────────────────

# 1. Compile LaTeX Sandbox
@router.post("/compile", summary="Compile LaTeX project files into a PDF preview")
def compile_latex(request: CompileRequest):
    """
    Compile multiple project files.
    Returns: success status, log output, parsed syntax errors, and Base64-encoded PDF.
    """
    success, pdf_bytes, logs, errors = latex_compile_service.compile_latex(
        files=request.files,
        compiler=request.compiler
    )

    return {
        "success": success,
        "logs": logs,
        "errors": errors,
        "pdf": base64.b64encode(pdf_bytes).decode("utf-8") if success else None
    }


# 2. CareerAI Resume Data -> LaTeX Generator
@router.post("/generate", summary="Convert CareerAI JSON resume data to LaTeX source")
def generate_latex(request: GenerateRequest, current_user_id: str = Depends(get_current_user_id)):
    """Converts the structured manual builder/AI Studio schema into valid LaTeX code."""
    try:
        from app.core.config import settings
        if not settings.GEMINI_API_KEY:
            # Generate clean LaTeX without hardcoded mock data
            p = request.resume_data.get("personal", {})
            name = latex_template_service.escape_latex(p.get("fullName") or "Your Name")
            summary = latex_template_service.escape_latex(request.resume_data.get("summary") or "")
            summary_section = f"\\section*{{Professional Summary}}\n{summary}\n" if summary else ""
            return {
                "success": True,
                "latex_code": (
                    "\\documentclass{article}\n"
                    "\\usepackage[utf8]{inputenc}\n"
                    "\\begin{document}\n"
                    "\\begin{center}\n"
                    f"{{\\LARGE \\textbf{{{name}}}}}\n"
                    "\\end{center}\n"
                    f"{summary_section}"
                    "\\end{document}"
                )
            }

        latex_code = latex_ai_service.generate_latex_from_resume(request.resume_data)
        return {"success": True, "latex_code": latex_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 3. LaTeX -> CareerAI Resume Data (Import)
@router.post("/import", summary="Parse LaTeX source back into CareerAI JSON data")
def import_latex(request: ImportRequest, current_user_id: str = Depends(get_current_user_id)):
    """Uses Gemini to interpret LaTeX source and structure it for the Manual Builder."""
    try:
        from app.core.config import settings
        if not settings.GEMINI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="LaTeX importing requires GEMINI_API_KEY in .env."
            )

        resume_data = latex_ai_service.import_latex_to_resume(request.latex_code)
        return {"success": True, "resume_data": resume_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 4. AI Assistant Edit LaTeX
@router.post("/ai/edit", summary="Edit LaTeX code using natural language")
def ai_edit_latex(request: AIEditRequest, current_user_id: str = Depends(get_current_user_id)):
    """Instruct Gemini to apply layout edits, formatting, or section updates to LaTeX."""
    try:
        from app.core.config import settings
        if not settings.GEMINI_API_KEY:
            return {
                "success": True,
                "demo_mode": True,
                "latex_code": request.latex_code + "\n% AI Edited with instructions: " + request.instruction
            }

        edited_code = latex_ai_service.ai_edit_latex(request.latex_code, request.instruction)
        return {"success": True, "latex_code": edited_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 5. AI Error Fixer
@router.post("/ai/fix", summary="Fix compilation errors in LaTeX source with AI")
def ai_fix_error(request: AIFixRequest, current_user_id: str = Depends(get_current_user_id)):
    """Analyzes compiler failures and provides corrected code blocks."""
    try:
        from app.core.config import settings
        if not settings.GEMINI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI Error Fixing requires GEMINI_API_KEY in .env."
            )

        fix_result = latex_ai_service.ai_fix_latex_error(
            latex_code=request.latex_code,
            error_msg=request.error_message,
            line_no=request.line_number
        )
        return {"success": True, **fix_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# 11. Templates: List Pre-installed Official Templates
@router.get("/templates", summary="List pre-installed official LaTeX templates (1-9)")
def list_latex_templates():
    """Return metadata for all 9 official LaTeX resume templates."""
    return latex_template_service.TEMPLATES_METADATA


# 12. Templates: Get Master Files of a Template
@router.get("/templates/{template_id}", summary="Get all files of a specific LaTeX template")
def get_latex_template_files(template_id: str):
    """Retrieve all files in a template directory, with main tex mapping to cv.tex."""
    try:
        files = latex_template_service.read_master_template_files(template_id)
        return {"success": True, "files": files}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Template {template_id} not found.")


# 13. Templates: Get Compiled PDF of Original Master Template (Preview)
@router.get("/templates/{template_id}/preview", summary="Get compiled PDF of original template")
def get_template_preview_pdf(template_id: str):
    """
    Compiles the original template files as-is from the disk and returns the PDF.
    """
    try:
        project_files = latex_template_service.get_original_template_files(template_id)
        
        # Determine compiler engine from TEMPLATES_METADATA
        meta = next((m for m in latex_template_service.TEMPLATES_METADATA if m["id"] == str(template_id)), None)
        compiler = meta.get("engine", "pdflatex") if meta else "pdflatex"
        
        success, pdf_bytes, logs, errors = latex_compile_service.compile_latex(
            files=project_files,
            compiler=compiler
        )
        
        if not success:
            raise HTTPException(status_code=500, detail=f"Compilation failed: {errors or logs}")
            
        return {
            "success": True,
            "pdf": base64.b64encode(pdf_bytes).decode("utf-8")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 14. Templates: Render & Compile Template with Resume Data
@router.post("/templates/{template_id}/render", summary="Render template with structured resume data and compile PDF")
def render_and_compile_template(template_id: str, request: RenderTemplateRequest):
    """
    Renders structured resume data into template files and compiles to PDF.
    """
    try:
        project_files = latex_template_service.render_resume_to_latex(
            template_id=template_id,
            raw_data=request.resume_data
        )

        success, pdf_bytes, logs, errors = latex_compile_service.compile_latex(
            files=project_files,
            compiler=request.compiler or "pdflatex"
        )

        return {
            "success": success,
            "template_id": template_id,
            "files": project_files,
            "pdf": base64.b64encode(pdf_bytes).decode("utf-8") if success else None,
            "logs": logs,
            "errors": errors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
