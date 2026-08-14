"""
app/api/routes/export.py
─────────────────────────
Resume PDF export endpoint.
"""

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services import resume_service
from app.services.pdf_service import generate_resume_pdf
from app.utils.helpers import sanitize_filename

router = APIRouter()


@router.get(
    "/{resume_id}/export/pdf",
    summary="Export resume as PDF",
    response_class=Response,
)
def export_resume_pdf(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Generate and download a PDF version of the resume.
    The PDF uses the resume's selected template styling.
    """
    resume = resume_service.get_resume_by_id(db, resume_id, current_user_id)
    pdf_bytes = generate_resume_pdf(resume)
    filename = sanitize_filename(resume.title)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
