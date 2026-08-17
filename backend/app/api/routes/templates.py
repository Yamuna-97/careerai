"""
app/api/routes/templates.py
────────────────────────────
Resume template listing endpoint using official templates (1-9).
"""

from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.latex_template_service import TEMPLATES_METADATA

router = APIRouter()


class TemplateInfo(BaseModel):
    id: str
    name: str
    category: Optional[str] = "General"
    compiler: Optional[str] = "pdflatex"
    description: str
    preview_color: str
    main_tex: Optional[str] = "cv.tex"


@router.get(
    "",
    response_model=List[TemplateInfo],
    summary="List available official resume templates",
)
def list_templates():
    """Return all available official resume templates (1 through 9)."""
    return TEMPLATES_METADATA
