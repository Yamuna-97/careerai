"""
app/api/routes/templates.py
────────────────────────────
Resume template listing endpoint.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class TemplateInfo(BaseModel):
    id: str
    name: str
    description: str
    preview_color: str


AVAILABLE_TEMPLATES = [
    TemplateInfo(id="modern",       name="Modern",       description="Clean and contemporary design with a bold header and accent colors.", preview_color="#3525cd"),
    TemplateInfo(id="professional", name="Professional", description="Classic and traditional layout suitable for corporate roles.",          preview_color="#1f2937"),
    TemplateInfo(id="minimal",      name="Minimal",      description="Simple and elegant with generous white space.",                         preview_color="#6b7280"),
    TemplateInfo(id="creative",     name="Creative",     description="Unique and expressive — great for design and tech roles.",              preview_color="#712ae2"),
]


@router.get(
    "",
    response_model=list[TemplateInfo],
    summary="List available resume templates",
)
def list_templates():
    """Return all available resume templates."""
    return AVAILABLE_TEMPLATES
