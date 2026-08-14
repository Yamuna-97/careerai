"""
app/models/latex.py
────────────────────
SQLAlchemy models for LaTeX projects and files.
Used to store Overleaf-style resume source codes and resource lists.
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class LatexProject(Base):
    """
    Represents a user's LaTeX resume project.
    Can consist of multiple files (e.g. cv.tex, refs.bib, images).
    """
    __tablename__ = "latex_projects"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    compiler = Column(String, default="pdflatex")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Cascades deletion down to associated project files
    files = relationship(
        "LatexProjectFile",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class LatexProjectFile(Base):
    """
    Represents an individual file inside a LaTeX project.
    Content stores the text of code files (.tex, .bib) or Base64 of binary files.
    """
    __tablename__ = "latex_project_files"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(
        String,
        ForeignKey("latex_projects.id", ondelete="CASCADE"),
        nullable=False
    )
    file_name = Column(String, nullable=False)
    content = Column(Text, nullable=True)  # Store code string or Base64 binary
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("LatexProject", back_populates="files")
