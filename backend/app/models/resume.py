"""
app/models/resume.py
─────────────────────
Resume SQLAlchemy model.
Each resume belongs to one user and contains multiple sections.
"""

import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # Foreign key to users table — ownership
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Resume metadata
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="My Resume")
    template: Mapped[str] = mapped_column(String(50), nullable=False, default="modern")

    # Personal information
    full_name: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    location: Mapped[str | None] = mapped_column(String(255))
    linkedin: Mapped[str | None] = mapped_column(String(500))
    github: Mapped[str | None] = mapped_column(String(500))
    portfolio: Mapped[str | None] = mapped_column(String(500))
    profile_image: Mapped[str | None] = mapped_column(String(1000))

    # Professional summary
    summary: Mapped[str | None] = mapped_column(Text)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships — cascade delete removes sections when resume is deleted
    user: Mapped["User"] = relationship("User", back_populates="resumes")
    education: Mapped[list["Education"]] = relationship(
        "Education", back_populates="resume", cascade="all, delete-orphan", order_by="Education.order_index"
    )
    experience: Mapped[list["Experience"]] = relationship(
        "Experience", back_populates="resume", cascade="all, delete-orphan", order_by="Experience.order_index"
    )
    projects: Mapped[list["Project"]] = relationship(
        "Project", back_populates="resume", cascade="all, delete-orphan", order_by="Project.order_index"
    )
    skills: Mapped[list["Skill"]] = relationship(
        "Skill", back_populates="resume", cascade="all, delete-orphan"
    )
    certifications: Mapped[list["Certification"]] = relationship(
        "Certification", back_populates="resume", cascade="all, delete-orphan"
    )
    achievements: Mapped[list["Achievement"]] = relationship(
        "Achievement", back_populates="resume", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Resume id={self.id} title={self.title}>"
