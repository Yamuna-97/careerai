"""
app/api/routes/interviews.py
────────────────────────────
FastAPI router endpoints for the Interview Preparation and Mock Interview module.
Includes session management, answer evaluation, progress stats, and WebSocket voice session.
"""

import json
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db, SessionLocal
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
    Start a mock interview session.
    Generates and returns the first adaptive question based on settings.
    """
    # Fetch user resume if resume-based is requested
    resume_context = ""
    if body.resume_based:
        resume = db.query(Resume).filter(Resume.user_id == current_user_id).order_by(Resume.updated_at.desc()).first()
        if resume:
            resume_context = f"Title: {resume.title}\nSummary: {resume.summary}\n"
            skills_list = ", ".join([s.name for s in resume.skills])
            resume_context += f"Skills: {skills_list}\n"
            edu_list = "; ".join([f"{e.degree} from {e.institution}" for e in resume.education])
            resume_context += f"Education: {edu_list}\n"
            exp_list = "; ".join([f"{ex.position} at {ex.company}" for ex in resume.experience])
            resume_context += f"Experience: {exp_list}\n"

    # Create session
    session = InterviewSession(
        user_id=current_user_id,
        role=body.role,
        difficulty=body.difficulty,
        interview_type=body.interview_type,
        format=body.format,
        num_questions=body.num_questions,
        duration=body.duration,
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
    first_question_text = interview_ai_service.generate_interview_question(
        session=session,
        previous_qas=[],
        resume_context=resume_context,
        job_context=body.job_description or ""
    )

    coding_meta = None
    question_display_text = first_question_text
    hint_text = None
    better_ans = None
    
    if body.interview_type.lower() == "coding":
        try:
            coding_data = json.loads(first_question_text)
            question_display_text = coding_data.get("question_text", first_question_text)
            coding_meta = json.dumps(coding_data.get("test_cases", []))
            hint_text = coding_data.get("hint", "")
            better_ans = coding_data.get("better_answer", "")
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


# ── 2. Get Interview Session ──────────────────────────────────────────────────
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


# ── 3. Submit Answer ──────────────────────────────────────────────────────────
@router.post(
    "/{session_id}/answer",
    response_model=AnswerEvaluationResponse,
    summary="Submit answer and get evaluation",
)
def submit_answer(
    session_id: str,
    body: InterviewAnswerCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Submits the answer for the current question in the session.
    Evaluates the answer and generates the next adaptive question.
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    # Find the current question (the last one generated)
    current_q = (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session_id)
        .order_by(InterviewQuestion.order_index.desc())
        .first()
    )

    if not current_q:
        raise HTTPException(status_code=404, detail="No question found for this session.")

    # Check if this question was already answered
    existing_ans = db.query(InterviewAnswer).filter(InterviewAnswer.question_id == current_q.id).first()
    if existing_ans:
        raise HTTPException(status_code=400, detail="This question has already been answered.")

    # Run code sandbox if coding interview
    sandbox_results = None
    if session.interview_type.lower() == "coding":
        sandbox_results = interview_ai_service.run_code_in_sandbox(
            language=session.language or "python",
            code=body.answer_text,
            test_cases_json=current_q.coding_metadata
        )

    # Evaluate the answer using Gemini
    evaluation = interview_ai_service.evaluate_answer(
        question_text=current_q.question_text,
        answer_text=body.answer_text,
        difficulty=session.difficulty,
        interview_type=session.interview_type,
        sandbox_results=sandbox_results
    )

    # Save answer and evaluations
    answer = InterviewAnswer(
        question_id=current_q.id,
        answer_text=body.answer_text,
        score=evaluation.get("score", 70),
        technical_accuracy=evaluation.get("technical_accuracy", 70),
        relevance=evaluation.get("relevance", 70),
        clarity=evaluation.get("clarity", 70),
        structure=evaluation.get("structure", 70),
        communication=evaluation.get("communication", 70),
        completeness=evaluation.get("completeness", 70),
        star_situation=evaluation.get("star_situation", False),
        star_task=evaluation.get("star_task", False),
        star_action=evaluation.get("star_action", False),
        star_result=evaluation.get("star_result", False),
        strengths_feedback=evaluation.get("strengths_feedback", ""),
        weaknesses_feedback=evaluation.get("weaknesses_feedback", ""),
        suggestions_feedback=evaluation.get("suggestions_feedback", ""),
    )
    db.add(answer)

    # Save better answer example on the question model for review later
    if evaluation.get("better_answer"):
        current_q.better_answer = evaluation.get("better_answer")
    db.commit()
    db.refresh(answer)

    # Check if session is completed
    is_completed = current_q.order_index >= session.num_questions
    next_question = None

    if not is_completed:
        # Load previous Q&As for adaptive context
        previous_questions = (
            db.query(InterviewQuestion)
            .filter(InterviewQuestion.session_id == session_id)
            .order_by(InterviewQuestion.order_index)
            .all()
        )
        previous_qas = []
        for q in previous_questions:
            ans = db.query(InterviewAnswer).filter(InterviewAnswer.question_id == q.id).first()
            if ans:
                previous_qas.append({"question": q.question_text, "answer": ans.answer_text})

        # Generate next question
        next_text = interview_ai_service.generate_interview_question(
            session=session,
            previous_qas=previous_qas,
            job_context=session.job_description or ""
        )

        next_coding_meta = None
        next_question_display_text = next_text
        next_hint = None
        next_better_ans = None

        if session.interview_type.lower() == "coding":
            try:
                next_coding_data = json.loads(next_text)
                next_question_display_text = next_coding_data.get("question_text", next_text)
                next_coding_meta = json.dumps(next_coding_data.get("test_cases", []))
                next_hint = next_coding_data.get("hint", "")
                next_better_ans = next_coding_data.get("better_answer", "")
            except Exception:
                next_coding_meta = None

        next_question = InterviewQuestion(
            session_id=session.id,
            question_text=next_question_display_text,
            order_index=current_q.order_index + 1,
            coding_metadata=next_coding_meta,
            hint=next_hint,
            better_answer=next_better_ans
        )
        db.add(next_question)
        db.commit()
        db.refresh(next_question)

    return AnswerEvaluationResponse(
        answer=answer,
        next_question=next_question,
        better_answer=current_q.better_answer,
        is_completed=is_completed,
    )


# ── 4. Get Hint ───────────────────────────────────────────────────────────────
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
        raise HTTPException(status_code=404, detail="No question found.")

    if current_q.hint:
        return HintResponse(hint=current_q.hint)

    # Generate hint using AI
    hint_text = interview_ai_service.generate_hint(current_q.question_text)
    current_q.hint = hint_text
    db.commit()

    return HintResponse(hint=hint_text)


# ── 5. Complete Interview & Summarize ─────────────────────────────────────────
@router.post(
    "/{session_id}/complete",
    response_model=InterviewSessionDetailResponse,
    summary="Complete interview session and generate roadmap summary",
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

    # Calculate overall scores
    questions = session.questions
    answered_qs = [q for q in questions if q.answer is not None]

    if not answered_qs:
        session.status = "completed"
        session.overall_score = 0
        db.commit()
        return session

    # Averages
    overall = round(sum(q.answer.score for q in answered_qs) / len(answered_qs))
    tech = round(sum(q.answer.technical_accuracy for q in answered_qs) / len(answered_qs))
    comm = round(sum(q.answer.communication for q in answered_qs) / len(answered_qs))
    relevance = round(sum(q.answer.relevance for q in answered_qs) / len(answered_qs))
    structure = round(sum(q.answer.structure for q in answered_qs) / len(answered_qs))
    clarity = round(sum(q.answer.clarity for q in answered_qs) / len(answered_qs))

    # AI overall summary roadmap
    qas = [{"question": q.question_text, "answer": q.answer.answer_text, "score": q.answer.score} for q in answered_qs]
    summary = interview_ai_service.generate_interview_summary(session, qas)

    session.overall_score = overall
    session.technical_score = tech
    session.communication_score = comm
    session.relevance_score = relevance
    session.confidence_score = clarity  # Proxy
    session.problem_solving_score = structure  # Proxy
    session.strengths = summary.get("overall_strengths", "")
    session.weaknesses = summary.get("overall_weaknesses", "")
    session.improvement_plan = summary.get("improvement_plan", "")
    session.status = "completed"

    db.commit()
    db.refresh(session)
    return session


# ── 6. Get Results ────────────────────────────────────────────────────────────
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
        improvement_plan=session.improvement_plan,
    )


# ── 7. Get History (with and without prefix) ───────────────────────────
@router.get(
    "/history/all",
    response_model=List[InterviewSessionSummaryResponse],
    summary="Get all completed interview history",
)
def get_history(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    return (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user_id, InterviewSession.status == "completed")
        .order_by(InterviewSession.updated_at.desc())
        .all()
    )


@router.get(
    "/history",
    response_model=List[InterviewSessionSummaryResponse],
    summary="Get all completed interview history alias",
)
def get_history_alias(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    return get_history(db, current_user_id)


# ── 8. Delete Interview Session ───────────────────────────────────────────────
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


# ── 9. Practice Again ─────────────────────────────────────────────────────────
@router.post(
    "/{session_id}/practice-again",
    response_model=InterviewQuestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start new session from previous configuration",
)
def practice_again(
    session_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    old_session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not old_session:
        raise HTTPException(status_code=404, detail="Original session not found.")
    
    session = InterviewSession(
        user_id=current_user_id,
        role=old_session.role,
        difficulty=old_session.difficulty,
        interview_type=old_session.interview_type,
        format=old_session.format,
        num_questions=old_session.num_questions,
        duration=old_session.duration,
        status="in_progress",
        job_company=old_session.job_company,
        job_title=old_session.job_title,
        job_description=old_session.job_description,
        language=old_session.language,
        topic=old_session.topic
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Generate first question
    first_text = interview_ai_service.generate_interview_question(session=session, previous_qas=[])
    
    coding_meta = None
    question_display_text = first_text
    hint_text = None
    better_ans = None

    if old_session.interview_type.lower() == "coding":
        try:
            coding_data = json.loads(first_text)
            question_display_text = coding_data.get("question_text", first_text)
            coding_meta = json.dumps(coding_data.get("test_cases", []))
            hint_text = coding_data.get("hint", "")
            better_ans = coding_data.get("better_answer", "")
        except Exception:
            coding_meta = None

    first_q = InterviewQuestion(
        session_id=session.id,
        question_text=question_display_text,
        order_index=1,
        coding_metadata=coding_meta,
        hint=hint_text,
        better_answer=better_ans
    )
    db.add(first_q)
    db.commit()
    db.refresh(first_q)

    return first_q


# ── 10. Get Overall Readiness ────────────────────────────────────────────────
@router.get(
    "/stats/readiness",
    response_model=InterviewReadinessResponse,
    summary="Get overall interview readiness scores",
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

    if not sessions:
        return InterviewReadinessResponse(
            readiness_score=72,
            technical=78,
            communication=68,
            confidence=71,
            problem_solving=76,
            behavioral=72,
            streak=0,
            completed_count=0,
            average_score=0,
            best_score=0,
        )

    avg_score = round(sum(s.overall_score for s in sessions if s.overall_score is not None) / len(sessions))
    avg_tech = round(sum(s.technical_score for s in sessions if s.technical_score is not None) / len(sessions))
    avg_comm = round(sum(s.communication_score for s in sessions if s.communication_score is not None) / len(sessions))
    avg_conf = round(sum(s.confidence_score for s in sessions if s.confidence_score is not None) / len(sessions))
    avg_prob = round(sum(s.problem_solving_score for s in sessions if s.problem_solving_score is not None) / len(sessions))
    best_score = max(s.overall_score for s in sessions if s.overall_score is not None)

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


# ── 11. WebSocket: Voice Interview Gateway ────────────────────────────────────
@router.websocket("/{session_id}/voice")
async def websocket_voice_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time voice interviews.
    Conducts the complete live audio mock session.
    """
    await websocket.accept()
    db = SessionLocal()
    try:
        # Initial connect acknowledgment
        await websocket.send_json({
            "event": "connected",
            "message": "Connected to CareerAI voice coach.",
            "session_id": session_id
        })

        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            await websocket.send_json({"event": "error", "message": "Session not found."})
            return

        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            event_type = payload.get("event")

            if event_type == "start":
                # Find or generate first question
                first_q = db.query(InterviewQuestion).filter(InterviewQuestion.session_id == session_id, InterviewQuestion.order_index == 1).first()
                if not first_q:
                    # Generate first question
                    first_text = interview_ai_service.generate_interview_question(session, [])
                    first_q = InterviewQuestion(session_id=session_id, question_text=first_text, order_index=1)
                    db.add(first_q)
                    db.commit()
                    db.refresh(first_q)
                
                await websocket.send_json({
                    "event": "speech",
                    "text": first_q.question_text,
                    "order_index": 1,
                    "total_questions": session.num_questions
                })

            elif event_type == "speech_input":
                user_answer_text = payload.get("text", "")
                if not user_answer_text.strip():
                    continue

                # Find the current question
                current_q = (
                    db.query(InterviewQuestion)
                    .filter(InterviewQuestion.session_id == session_id)
                    .order_by(InterviewQuestion.order_index.desc())
                    .first()
                )

                if not current_q:
                    continue

                # Check if already answered
                existing_ans = db.query(InterviewAnswer).filter(InterviewAnswer.question_id == current_q.id).first()
                if existing_ans:
                    continue

                # Evaluate answer
                evaluation = interview_ai_service.evaluate_answer(
                    question_text=current_q.question_text,
                    answer_text=user_answer_text,
                    difficulty=session.difficulty,
                    interview_type=session.interview_type
                )

                answer = InterviewAnswer(
                    question_id=current_q.id,
                    answer_text=user_answer_text,
                    score=evaluation.get("score", 70),
                    technical_accuracy=evaluation.get("technical_accuracy", 70),
                    relevance=evaluation.get("relevance", 70),
                    clarity=evaluation.get("clarity", 70),
                    structure=evaluation.get("structure", 70),
                    communication=evaluation.get("communication", 70),
                    completeness=evaluation.get("completeness", 70),
                    star_situation=evaluation.get("star_situation", False),
                    star_task=evaluation.get("star_task", False),
                    star_action=evaluation.get("star_action", False),
                    star_result=evaluation.get("star_result", False),
                    strengths_feedback=evaluation.get("strengths_feedback", ""),
                    weaknesses_feedback=evaluation.get("weaknesses_feedback", ""),
                    suggestions_feedback=evaluation.get("suggestions_feedback", ""),
                )
                db.add(answer)
                current_q.better_answer = evaluation.get("better_answer", "")
                db.commit()

                # Check if session is completed
                is_completed = current_q.order_index >= session.num_questions
                if is_completed:
                    # Trigger summary and complete
                    answered_qs = db.query(InterviewQuestion).filter(InterviewQuestion.session_id == session_id).all()
                    answered_qs = [q for q in answered_qs if q.answer is not None]
                    
                    overall = round(sum(q.answer.score for q in answered_qs) / len(answered_qs))
                    tech = round(sum(q.answer.technical_accuracy for q in answered_qs) / len(answered_qs))
                    comm = round(sum(q.answer.communication for q in answered_qs) / len(answered_qs))
                    relevance = round(sum(q.answer.relevance for q in answered_qs) / len(answered_qs))
                    structure = round(sum(q.answer.structure for q in answered_qs) / len(answered_qs))
                    clarity = round(sum(q.answer.clarity for q in answered_qs) / len(answered_qs))
                    
                    qas = [{"question": q.question_text, "answer": q.answer.answer_text, "score": q.answer.score} for q in answered_qs]
                    summary = interview_ai_service.generate_interview_summary(session, qas)

                    session.overall_score = overall
                    session.technical_score = tech
                    session.communication_score = comm
                    session.relevance_score = relevance
                    session.confidence_score = clarity
                    session.problem_solving_score = structure
                    session.strengths = summary.get("overall_strengths", "")
                    session.weaknesses = summary.get("overall_weaknesses", "")
                    session.improvement_plan = summary.get("improvement_plan", "")
                    session.status = "completed"
                    db.commit()

                    await websocket.send_json({
                        "event": "completed",
                        "message": "Session completed!",
                        "overall_score": overall
                    })
                else:
                    # Generate next question
                    previous_questions = (
                        db.query(InterviewQuestion)
                        .filter(InterviewQuestion.session_id == session_id)
                        .order_by(InterviewQuestion.order_index)
                        .all()
                    )
                    previous_qas = [{"question": q.question_text, "answer": q.answer.answer_text} for q in previous_questions if q.answer]
                    
                    next_text = interview_ai_service.generate_interview_question(session, previous_qas)
                    next_q = InterviewQuestion(
                        session_id=session_id,
                        question_text=next_text,
                        order_index=current_q.order_index + 1
                    )
                    db.add(next_q)
                    db.commit()

                    await websocket.send_json({
                        "event": "speech",
                        "text": next_text,
                        "order_index": current_q.order_index + 1,
                        "total_questions": session.num_questions
                    })

            elif event_type == "mute":
                await websocket.send_json({"event": "status", "message": "Microphone muted"})
            elif event_type == "pause":
                await websocket.send_json({"event": "status", "message": "Interview paused"})

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session: {session_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        db.close()
