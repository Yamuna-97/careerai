"""
app/api/routes/interviews.py
────────────────────────────
FastAPI router for AI Mock Interview Module.

Handles:
- Text-based session setup & question progression.
- Answer evaluation & mathematical weighted score persistence.
- Anti-repetition question generation (using resume, JD, past QAs, and topics).
- Final session reporting & personalized improvement plans.
"""

import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.interview import InterviewSession, InterviewQuestion, InterviewAnswer
from app.models.resume import Resume
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewQuestionResponse,
    InterviewAnswerCreate,
    AnswerEvaluationResponse,
    InterviewSessionSummaryResponse,
    InterviewSessionDetailResponse,
    InterviewResultsResponse,
    InterviewReadinessResponse,
    HintResponse,
)
from app.services import interview_ai_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ── 1. Start Interview Session ────────────────────────────────────────────────
@router.post(
    "/start",
    response_model=InterviewQuestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a new mock interview session",
)
def start_interview(
    body: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Start a text-based mock interview session.
    Generates and returns the first question based on role, difficulty, resume, and JD.
    """
    resume_context = ""
    if body.resume_based:
        resume = db.query(Resume).filter(Resume.user_id == current_user_id).order_by(Resume.updated_at.desc()).first()
        if resume:
            resume_context = f"Title: {resume.title or ''}\nSummary: {resume.summary or ''}\n"
            if resume.skills:
                skills_list = ", ".join([s.name for s in resume.skills if hasattr(s, 'name')])
                resume_context += f"Skills: {skills_list}\n"
            if resume.education:
                edu_list = "; ".join([f"{e.degree} from {e.institution}" for e in resume.education if hasattr(e, 'institution')])
                resume_context += f"Education: {edu_list}\n"
            if resume.experience:
                exp_list = "; ".join([f"{ex.position} at {ex.company}" for ex in resume.experience if hasattr(ex, 'company')])
                resume_context += f"Experience: {exp_list}\n"

    session = InterviewSession(
        user_id=current_user_id,
        role=body.role or "Software Engineer",
        difficulty=body.difficulty or "intermediate",
        interview_type=body.interview_type or "Technical",
        format="text",
        num_questions=body.num_questions or 10,
        duration=body.duration or 15,
        status="in_progress",
        job_company=body.job_company,
        job_title=body.job_title,
        job_description=body.job_description,
        language=body.language,
        topic=body.topic,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Generate first question
    first_q_data = interview_ai_service.generate_interview_question(
        session=session,
        previous_qas=[],
        resume_context=resume_context,
        job_context=body.job_description or "",
        asked_questions=[]
    )

    coding_meta = None
    question_display_text = first_q_data.get("question_text", "")
    hint_text = first_q_data.get("hint", "")
    better_ans = first_q_data.get("better_answer", "")

    if body.interview_type.lower() == "coding" and "test_cases" in first_q_data:
        try:
            coding_meta = json.dumps(first_q_data.get("test_cases", []))
        except Exception:
            coding_meta = None

    first_question = InterviewQuestion(
        session_id=session.id,
        question_text=question_display_text,
        order_index=1,
        coding_metadata=coding_meta,
        hint=hint_text,
        better_answer=better_ans
    )
    db.add(first_question)
    db.commit()
    db.refresh(first_question)

    return first_question


# ── 2. Readiness Stats & History ──────────────────────────────────────────────
@router.get(
    "/stats/readiness",
    response_model=InterviewReadinessResponse,
    summary="Get overall interview readiness scores from completed sessions",
)
def get_readiness(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user_id, InterviewSession.status == "completed")
        .all()
    )

    if not sessions or not any(s.overall_score is not None for s in sessions):
        return InterviewReadinessResponse(
            readiness_score=0,
            technical=0,
            communication=0,
            confidence=0,
            problem_solving=0,
            behavioral=0,
            streak=0,
            completed_count=0,
            average_score=0,
            best_score=0,
        )

    valid_sessions = [s for s in sessions if s.overall_score is not None]
    avg_score = round(sum(s.overall_score for s in valid_sessions) / len(valid_sessions))
    avg_tech = round(sum(s.technical_score or s.overall_score for s in valid_sessions) / len(valid_sessions))
    avg_comm = round(sum(s.communication_score or s.overall_score for s in valid_sessions) / len(valid_sessions))
    avg_conf = round(sum(s.confidence_score or s.overall_score for s in valid_sessions) / len(valid_sessions))
    avg_prob = round(sum(s.problem_solving_score or s.overall_score for s in valid_sessions) / len(valid_sessions))
    best_score = max(s.overall_score for s in valid_sessions)

    return InterviewReadinessResponse(
        readiness_score=avg_score,
        technical=avg_tech,
        communication=avg_comm,
        confidence=avg_conf,
        problem_solving=avg_prob,
        behavioral=avg_comm,
        streak=len(sessions),
        completed_count=len(sessions),
        average_score=avg_score,
        best_score=best_score,
    )


@router.get(
    "/readiness",
    response_model=InterviewReadinessResponse,
    summary="Get overall interview readiness scores alias",
)
def get_readiness_alias(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    return get_readiness(db, current_user_id)


# ── 3. Get Session Details ───────────────────────────────────────────────────
@router.get(
    "/{session_id}",
    response_model=InterviewSessionDetailResponse,
    summary="Get details of a specific interview session",
)
def get_interview(
    session_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    if session.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return session


# ── 4. Submit Answer & Real Evaluation ──────────────────────────────────────
@router.post(
    "/{session_id}/answer",
    response_model=AnswerEvaluationResponse,
    summary="Submit typed answer and receive real AI evaluation",
)
def submit_answer(
    session_id: str,
    body: InterviewAnswerCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Evaluates candidate's actual typed response using Gemini & weighted scoring.
    Does NOT auto-advance to next question; candidate reviews evaluation first.
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    # Find the current question (order index highest)
    current_q = (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session_id)
        .order_by(InterviewQuestion.order_index.desc())
        .first()
    )

    if not current_q:
        raise HTTPException(status_code=404, detail="No active question found for this session.")

    existing_ans = db.query(InterviewAnswer).filter(InterviewAnswer.question_id == current_q.id).first()
    if existing_ans:
        raise HTTPException(status_code=400, detail="This question has already been answered.")

    # Execute sandbox if coding interview
    sandbox_results = None
    if session.interview_type.lower() == "coding":
        sandbox_results = interview_ai_service.run_code_in_sandbox(
            language=session.language or "python",
            code=body.answer_text,
            test_cases_json=current_q.coding_metadata
        )

    # Real evaluation call (raises exception if AI unavailable — NO fabricated score!)
    evaluation = interview_ai_service.evaluate_answer(
        question_text=current_q.question_text,
        answer_text=body.answer_text,
        difficulty=session.difficulty,
        interview_type=session.interview_type,
        sandbox_results=sandbox_results
    )

    answer = InterviewAnswer(
        question_id=current_q.id,
        answer_text=body.answer_text,
        score=evaluation.get("score", 0),
        technical_accuracy=evaluation.get("technical_accuracy", 0),
        relevance=evaluation.get("relevance", 0),
        clarity=evaluation.get("clarity", 0),
        structure=evaluation.get("structure", 0),
        communication=evaluation.get("communication", 0),
        completeness=evaluation.get("completeness", 0),
        star_situation=evaluation.get("star_situation", False),
        star_task=evaluation.get("star_task", False),
        star_action=evaluation.get("star_action", False),
        star_result=evaluation.get("star_result", False),
        strengths_feedback=evaluation.get("strengths_feedback", ""),
        weaknesses_feedback=evaluation.get("weaknesses_feedback", ""),
        suggestions_feedback=evaluation.get("suggestions_feedback", ""),
    )
    db.add(answer)

    if evaluation.get("better_answer"):
        current_q.better_answer = evaluation.get("better_answer")

    db.commit()
    db.refresh(answer)

    is_completed = current_q.order_index >= session.num_questions

    return AnswerEvaluationResponse(
        answer=answer,
        next_question=None,
        better_answer=current_q.better_answer,
        is_completed=is_completed,
    )


# ── 5. Generate Next Question ────────────────────────────────────────────────
@router.post(
    "/{session_id}/next-question",
    summary="Generate the next non-repetitive adaptive question",
)
def generate_next_question(
    session_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    questions = db.query(InterviewQuestion).filter(InterviewQuestion.session_id == session_id).order_by(InterviewQuestion.order_index).all()
    answered_qs = [q for q in questions if q.answer is not None]

    if len(answered_qs) >= session.num_questions:
        # Complete session and calculate mathematical averages
        session.status = "completed"
        scores = [q.answer.score for q in answered_qs]
        session.overall_score = round(sum(scores) / len(scores))
        session.technical_score = round(sum(q.answer.technical_accuracy for q in answered_qs) / len(answered_qs))
        session.communication_score = round(sum(q.answer.communication for q in answered_qs) / len(answered_qs))
        session.relevance_score = round(sum(q.answer.relevance for q in answered_qs) / len(answered_qs))
        session.confidence_score = round(sum(q.answer.clarity for q in answered_qs) / len(answered_qs))
        session.problem_solving_score = round(sum(q.answer.structure for q in answered_qs) / len(answered_qs))

        qas = [{"question": q.question_text, "answer": q.answer.answer_text, "score": q.answer.score} for q in answered_qs]
        summary = interview_ai_service.generate_interview_summary(session, qas)

        session.strengths = summary.get("overall_strengths", "")
        session.weaknesses = summary.get("overall_weaknesses", "")
        session.improvement_plan = summary.get("improvement_plan", "")
        db.commit()

        return {"completed": True, "session_id": session_id}

    # Extract resume context
    resume_context = ""
    resume = db.query(Resume).filter(Resume.user_id == current_user_id).order_by(Resume.updated_at.desc()).first()
    if resume:
        skills_str = ", ".join([s.name for s in resume.skills]) if resume.skills else ""
        resume_context = f"Summary: {resume.summary or ''}\nSkills: {skills_str}"

    # Previous QAs and Asked Questions
    previous_qas = [{"question": q.question_text, "answer": q.answer.answer_text, "score": q.answer.score} for q in answered_qs]
    asked_questions = [q.question_text for q in questions]

    next_q_data = interview_ai_service.generate_interview_question(
        session=session,
        previous_qas=previous_qas,
        resume_context=resume_context,
        job_context=session.job_description or "",
        asked_questions=asked_questions
    )

    coding_meta = None
    question_display_text = next_q_data.get("question_text", "")
    hint_text = next_q_data.get("hint", "")
    better_ans = next_q_data.get("better_answer", "")

    if session.interview_type.lower() == "coding" and "test_cases" in next_q_data:
        try:
            coding_meta = json.dumps(next_q_data.get("test_cases", []))
        except Exception:
            coding_meta = None

    next_question = InterviewQuestion(
        session_id=session.id,
        question_text=question_display_text,
        order_index=len(questions) + 1,
        coding_metadata=coding_meta,
        hint=hint_text,
        better_answer=better_ans
    )
    db.add(next_question)
    db.commit()
    db.refresh(next_question)

    return {
        "completed": False,
        "question": {
            "id": next_question.id,
            "session_id": session.id,
            "question_text": next_question.question_text,
            "order_index": next_question.order_index,
            "hint": next_question.hint,
            "coding_metadata": next_question.coding_metadata
        }
    }


# ── 6. Get Hint ───────────────────────────────────────────────────────────────
@router.post(
    "/{session_id}/hint",
    response_model=HintResponse,
    summary="Get a hint for the current question",
)
def get_hint(
    session_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    current_q = (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session_id)
        .order_by(InterviewQuestion.order_index.desc())
        .first()
    )

    if not current_q:
        raise HTTPException(status_code=404, detail="No active question found.")

    if current_q.hint:
        return HintResponse(hint=current_q.hint)

    hint_text = interview_ai_service.generate_hint(current_q.question_text)
    current_q.hint = hint_text
    db.commit()

    return HintResponse(hint=hint_text)


# ── 7. Complete Session Manually ──────────────────────────────────────────────
@router.post(
    "/{session_id}/complete",
    response_model=InterviewSessionDetailResponse,
    summary="Complete interview session and generate summary",
)
def complete_interview(
    session_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    questions = session.questions
    answered_qs = [q for q in questions if q.answer is not None]

    if not answered_qs:
        session.status = "completed"
        session.overall_score = 0
        db.commit()
        return session

    scores = [q.answer.score for q in answered_qs]
    session.overall_score = round(sum(scores) / len(scores))
    session.technical_score = round(sum(q.answer.technical_accuracy for q in answered_qs) / len(answered_qs))
    session.communication_score = round(sum(q.answer.communication for q in answered_qs) / len(answered_qs))
    session.relevance_score = round(sum(q.answer.relevance for q in answered_qs) / len(answered_qs))
    session.confidence_score = round(sum(q.answer.clarity for q in answered_qs) / len(answered_qs))
    session.problem_solving_score = round(sum(q.answer.structure for q in answered_qs) / len(answered_qs))

    qas = [{"question": q.question_text, "answer": q.answer.answer_text, "score": q.answer.score} for q in answered_qs]
    summary = interview_ai_service.generate_interview_summary(session, qas)

    session.strengths = summary.get("overall_strengths", "")
    session.weaknesses = summary.get("overall_weaknesses", "")
    session.improvement_plan = summary.get("improvement_plan", "")
    session.status = "completed"

    db.commit()
    db.refresh(session)
    return session


# ── 8. Get Results ────────────────────────────────────────────────────────────
@router.get(
    "/{session_id}/results",
    response_model=InterviewResultsResponse,
    summary="Get full results of a completed session",
)
def get_results(
    session_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    qna_review = []
    for q in session.questions:
        ans = q.answer
        if ans:
            qna_review.append({
                "question": q.question_text,
                "answer": ans.answer_text,
                "score": ans.score,
                "technical_accuracy": ans.technical_accuracy,
                "communication": ans.communication,
                "relevance": ans.relevance,
                "strengths": ans.strengths_feedback,
                "weaknesses": ans.weaknesses_feedback,
                "suggestions": ans.suggestions_feedback,
                "better_answer": q.better_answer,
                "star_situation": ans.star_situation,
                "star_task": ans.star_task,
                "star_action": ans.star_action,
                "star_result": ans.star_result,
            })

    return InterviewResultsResponse(
        session=session,
        qna_review=qna_review,
        improvement_plan=session.improvement_plan or "",
    )


# ── 9. Delete Session ─────────────────────────────────────────────────────────
@router.delete(
    "/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an interview session",
)
def delete_interview(
    session_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    db.delete(session)
    db.commit()
