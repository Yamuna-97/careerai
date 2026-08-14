"""
app/schemas/interview.py
─────────────────────────
Pydantic validation and serialization schemas for AI Mock Interviews.
"""

from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


# ── Setup & Start ─────────────────────────────────────────────────────────────

class InterviewStartRequest(BaseModel):
    role: str
    difficulty: str  # beginner, intermediate, pro
    interview_type: str  # HR, Technical, Mixed, etc.
    format: str = "text"  # text, voice
    num_questions: int = 5
    duration: int = 15
    resume_based: bool = False
    job_id: Optional[str] = None
    job_company: Optional[str] = None
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    language: Optional[str] = None
    topic: Optional[str] = None


# ── Question/Answer ───────────────────────────────────────────────────────────

class InterviewAnswerCreate(BaseModel):
    answer_text: str


class InterviewQuestionResponse(BaseModel):
    id: str
    session_id: str
    question_text: str
    order_index: int
    hint: Optional[str] = None
    coding_metadata: Optional[str] = None

    model_config = {"from_attributes": True}
    
    
class InterviewAnswerResponse(BaseModel):
    id: str
    question_id: str
    answer_text: str
    score: int
    technical_accuracy: int
    relevance: int
    clarity: int
    structure: int
    communication: int
    completeness: int
    star_situation: bool
    star_task: bool
    star_action: bool
    star_result: bool
    strengths_feedback: Optional[str] = None
    weaknesses_feedback: Optional[str] = None
    suggestions_feedback: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Custom Evaluated Answer Response ──────────────────────────────────────────

class AnswerEvaluationResponse(BaseModel):
    answer: InterviewAnswerResponse
    next_question: Optional[InterviewQuestionResponse] = None
    better_answer: Optional[str] = None
    is_completed: bool = False


# ── Session Overview & History ────────────────────────────────────────────────

class InterviewSessionSummaryResponse(BaseModel):
    id: str
    user_id: str
    role: str
    difficulty: str
    interview_type: str
    format: str
    num_questions: int
    duration: int
    status: str
    overall_score: Optional[int] = None
    job_company: Optional[str] = None
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    language: Optional[str] = None
    topic: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InterviewSessionDetailResponse(InterviewSessionSummaryResponse):
    questions: List[InterviewQuestionResponse] = []
    technical_score: Optional[int] = None
    communication_score: Optional[int] = None
    confidence_score: Optional[int] = None
    problem_solving_score: Optional[int] = None
    relevance_score: Optional[int] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    improvement_plan: Optional[str] = None


class InterviewResultsResponse(BaseModel):
    session: InterviewSessionDetailResponse
    qna_review: List[dict]  # Custom structured key-value list of questions, answers, and metrics
    improvement_plan: Optional[str] = None


class InterviewReadinessResponse(BaseModel):
    readiness_score: int
    technical: int
    communication: int
    confidence: int
    problem_solving: int
    behavioral: int
    streak: int
    completed_count: int
    average_score: int
    best_score: int


class HintResponse(BaseModel):
    hint: str
