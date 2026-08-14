"""
app/models/interview.py
────────────────────────
SQLAlchemy database models for AI Mock Interviews.
"""

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    role: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)  # beginner, intermediate, pro
    interview_type: Mapped[str] = mapped_column(String(50), nullable=False)  # HR, Technical, Mixed, etc.
    format: Mapped[str] = mapped_column(String(50), nullable=False, default="text")  # text, voice
    num_questions: Mapped[int] = mapped_column(Integer, default=5)
    duration: Mapped[int] = mapped_column(Integer, default=15)  # in minutes
    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress, completed

    # Job context (for job-specific interviews)
    job_company: Mapped[str | None] = mapped_column(String(255))
    job_title: Mapped[str | None] = mapped_column(String(255))
    job_description: Mapped[str | None] = mapped_column(Text)

    # Coding-specific configuration
    language: Mapped[str | None] = mapped_column(String(50))  # python, javascript, java, cpp
    topic: Mapped[str | None] = mapped_column(String(100))

    # Overall session evaluation metrics
    overall_score: Mapped[int | None] = mapped_column(Integer)
    technical_score: Mapped[int | None] = mapped_column(Integer)
    communication_score: Mapped[int | None] = mapped_column(Integer)
    confidence_score: Mapped[int | None] = mapped_column(Integer)
    problem_solving_score: Mapped[int | None] = mapped_column(Integer)
    relevance_score: Mapped[int | None] = mapped_column(Integer)

    # Text fields for plan and summary
    strengths: Mapped[str | None] = mapped_column(Text)
    weaknesses: Mapped[str | None] = mapped_column(Text)
    improvement_plan: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    questions: Mapped[list["InterviewQuestion"]] = relationship(
        "InterviewQuestion", back_populates="session", cascade="all, delete-orphan", order_by="InterviewQuestion.order_index"
    )


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )

    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    hint: Mapped[str | None] = mapped_column(Text)
    better_answer: Mapped[str | None] = mapped_column(Text)
    coding_metadata: Mapped[str | None] = mapped_column(Text)  # Stores coding problem description & test cases as JSON

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session: Mapped["InterviewSession"] = relationship("InterviewSession", back_populates="questions")
    answer: Mapped["InterviewAnswer | None"] = relationship(
        "InterviewAnswer", back_populates="question", cascade="all, delete-orphan"
    )


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    question_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )

    answer_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Question specific evaluation metrics
    score: Mapped[int] = mapped_column(Integer, default=0)
    technical_accuracy: Mapped[int] = mapped_column(Integer, default=0)
    relevance: Mapped[int] = mapped_column(Integer, default=0)
    clarity: Mapped[int] = mapped_column(Integer, default=0)
    structure: Mapped[int] = mapped_column(Integer, default=0)
    communication: Mapped[int] = mapped_column(Integer, default=0)
    completeness: Mapped[int] = mapped_column(Integer, default=0)

    # STAR behavioral analysis flags
    star_situation: Mapped[bool] = mapped_column(Boolean, default=False)
    star_task: Mapped[bool] = mapped_column(Boolean, default=False)
    star_action: Mapped[bool] = mapped_column(Boolean, default=False)
    star_result: Mapped[bool] = mapped_column(Boolean, default=False)

    # Feedback summaries
    strengths_feedback: Mapped[str | None] = mapped_column(Text)
    weaknesses_feedback: Mapped[str | None] = mapped_column(Text)
    suggestions_feedback: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    question: Mapped["InterviewQuestion"] = relationship("InterviewQuestion", back_populates="answer")
