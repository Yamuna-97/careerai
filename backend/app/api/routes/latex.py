"""
app/api/routes/latex.py
────────────────────────
FastAPI endpoints for Overleaf-style LaTeX Resume Editor.
Supports compilation sandbox, templates, AI editing, and DB project storage.
"""

import base64
import uuid
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.latex import LatexProject, LatexProjectFile
from app.services import latex_compile_service, latex_ai_service

router = APIRouter()


# ── Request / Response Schemas ─────────────────────────────────────────────────

class CompileRequest(BaseModel):
    files: Dict[str, str]  # filename -> code string (or Base64 binary)
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


class ProjectCreateRequest(BaseModel):
    name: str
    compiler: Optional[str] = "pdflatex"
    initial_latex: Optional[str] = None


class ProjectSaveRequest(BaseModel):
    files: Dict[str, str]  # filename -> content


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

    response_data = {
        "success": success,
        "logs": logs,
        "errors": errors,
        "pdf": base64.b64encode(pdf_bytes).decode("utf-8") if success else None
    }
    return response_data


# 2. CareerAI Resume Data -> LaTeX Generator
@router.post("/generate", summary="Convert CareerAI JSON resume data to LaTeX source")
def generate_latex(request: GenerateRequest, current_user_id: str = Depends(get_current_user_id)):
    """Converts the structured manual builder/AI Studio schema into valid LaTeX code."""
    try:
        from app.core.config import settings
        if not settings.GEMINI_API_KEY:
            # Return template fallback
            return {
                "success": True,
                "demo_mode": True,
                "latex_code": (
                    "\\documentclass{article}\n"
                    "\\begin{document}\n"
                    "\\begin{center}\n"
                    f"{{\\LARGE {request.resume_data.get('personal', {}).get('fullName', 'Jane Doe')}}}\n"
                    "\\end{center}\n"
                    "\\section*{Summary}\n"
                    f"{request.resume_data.get('summary', 'AI-generated resume summary.')}\n"
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


# 6. Database: List Projects
@router.get("/projects", summary="List all saved LaTeX projects")
def list_projects(db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    projects = db.query(LatexProject).filter(LatexProject.user_id == current_user_id).all()
    return {
        "success": True,
        "projects": [
            {
                "id": p.id,
                "name": p.name,
                "compiler": p.compiler,
                "created_at": p.created_at,
                "updated_at": p.updated_at
            }
            for p in projects
        ]
    }


# 7. Database: Create Project
@router.post("/projects", summary="Create a new LaTeX project")
def create_project(request: ProjectCreateRequest, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    project_id = str(uuid.uuid4())
    
    # Create project entry
    project = LatexProject(
        id=project_id,
        user_id=current_user_id,
        name=request.name,
        compiler=request.compiler
    )
    db.add(project)
    
    # Write initial cv.tex
    default_latex = request.initial_latex or (
        "\\documentclass{article}\n"
        "\\usepackage[utf8]{inputenc}\n\n"
        "\\begin{document}\n\n"
        "\\begin{center}\n"
        f"{{\\LARGE \\textbf{{{current_user_id.capitalize()}}}}}\n"
        "\\end{center}\n\n"
        "\\section*{Professional Summary}\n"
        "Experienced engineer seeking ML opportunities.\n\n"
        "\\section*{Education}\n"
        "Kongu Engineering College -- B.Tech AI & Data Science (2024-2028)\n\n"
        "\\end{document}\n"
    )

    file_id = str(uuid.uuid4())
    tex_file = LatexProjectFile(
        id=file_id,
        project_id=project_id,
        file_name="cv.tex",
        content=default_latex
    )
    db.add(tex_file)
    db.commit()

    return {"success": True, "project_id": project_id, "name": request.name}


# 8. Database: Load Project Files
@router.get("/projects/{project_id}", summary="Load all files in a LaTeX project")
def get_project_files(project_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    project = db.query(LatexProject).filter(
        LatexProject.id == project_id,
        LatexProject.user_id == current_user_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    files = db.query(LatexProjectFile).filter(LatexProjectFile.project_id == project_id).all()
    return {
        "success": True,
        "project": {
            "id": project.id,
            "name": project.name,
            "compiler": project.compiler
        },
        "files": {f.file_name: f.content for f in files}
    }


# 9. Database: Save Project Files
@router.put("/projects/{project_id}", summary="Update files inside a LaTeX project")
def save_project_files(
    project_id: str,
    request: ProjectSaveRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    project = db.query(LatexProject).filter(
        LatexProject.id == project_id,
        LatexProject.user_id == current_user_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    # Remove existing files of the project first
    db.query(LatexProjectFile).filter(LatexProjectFile.project_id == project_id).delete()

    # Re-insert files
    for name, content in request.files.items():
        tex_file = LatexProjectFile(
            id=str(uuid.uuid4()),
            project_id=project_id,
            file_name=name,
            content=content
        )
        db.add(tex_file)

    project.updated_at = __import__("datetime").datetime.utcnow()
    db.commit()

    return {"success": True}


# 10. Database: Delete Project
@router.delete("/projects/{project_id}", summary="Delete a LaTeX project")
def delete_project(project_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)):
    project = db.query(LatexProject).filter(
        LatexProject.id == project_id,
        LatexProject.user_id == current_user_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    db.delete(project)
    db.commit()
    return {"success": True}
