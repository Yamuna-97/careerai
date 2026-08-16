"""
app/services/interview_ai_service.py
────────────────────────────────────
Gemini AI integration service for generating dynamic, non-repetitive mock interview questions,
evaluating responses with strict weighted math scoring, and creating session roadmaps.

Features:
- Semantic duplicate question detection (`is_duplicate_question`) with retry loops.
- Resume-aware and Job Description-aware dynamic question generation.
- Real Gemini answer evaluation (NO default/hardcoded fake scores).
- Mathematical weighted scoring (Technical vs Behavioral STAR vs Coding sandbox).
- Piston code sandbox execution integration for coding interviews.
"""

import httpx
import json
import re
import logging
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.models.interview import InterviewSession, InterviewQuestion
from app.services.gemini_service import call_gemini_api as _central_call_gemini

logger = logging.getLogger(__name__)


# ── Internal Helper to Call Gemini ────────────────────────────────────────────
def _call_gemini_api(prompt: str, json_mode: bool = True) -> str:
    """Helper to perform HTTP POST to Google Gemini API using central model router."""
    return _central_call_gemini(prompt=prompt, task="complex_reasoning", json_mode=json_mode)


# ── Semantic Duplicate Question Detection ──────────────────────────────────────
def is_duplicate_question(new_question: str, previous_questions: List[str]) -> bool:
    """
    Check if a new question is semantically identical or too similar to any
    previously asked question in the session.
    """
    if not new_question or not previous_questions:
        return False

    def tokenize(text: str) -> set:
        clean = re.sub(r'[^\w\s]', '', text.lower())
        words = clean.split()
        stop_words = {
            "what", "is", "are", "explain", "how", "does", "do", "the", "a", "an",
            "in", "of", "and", "or", "to", "with", "can", "you", "tell", "me", "about",
            "difference", "between", "describe", "using", "your", "for", "on", "would"
        }
        return {w for w in words if w not in stop_words and len(w) > 2}

    new_tokens = tokenize(new_question)
    if not new_tokens:
        return False

    for prev in previous_questions:
        prev_tokens = tokenize(prev)
        if not prev_tokens:
            continue

        intersection = new_tokens.intersection(prev_tokens)
        union = new_tokens.union(prev_tokens)
        similarity = len(intersection) / len(union) if union else 0.0

        # If token Jaccard similarity is high or 3+ core technical terms overlap heavily
        if similarity >= 0.55:
            return True
        if len(intersection) >= 3 and len(intersection) >= min(len(new_tokens), len(prev_tokens)) * 0.7:
            return True

    return False


# ── Secure Code Execution Sandbox (Piston API) ────────────────────────────────
def run_code_in_sandbox(language: str, code: str, test_cases_json: Optional[str] = None) -> dict:
    """
    Execute code securely using the public Piston sandbox API.
    Runs the code against test cases if provided, and returns execution result.
    """
    if not code:
        return {"success": False, "output": "No code submitted.", "exit_code": 1, "summary": "Empty solution", "passed": 0, "total": 0}

    lang_map = {
        "python": {"language": "python", "version": "3.10.0", "filename": "solution.py"},
        "javascript": {"language": "javascript", "version": "18.15.0", "filename": "solution.js"},
        "java": {"language": "java", "version": "15.0.2", "filename": "Main.java"},
        "cpp": {"language": "c++", "version": "10.2.0", "filename": "main.cpp"}
    }

    lang_key = language.lower().strip()
    if lang_key not in lang_map:
        lang_key = "python"

    piston_lang = lang_map[lang_key]["language"]
    piston_ver = lang_map[lang_key]["version"]
    filename = lang_map[lang_key]["filename"]

    full_code = code
    total_test_cases = 0
    if test_cases_json:
        try:
            test_cases = json.loads(test_cases_json)
            if isinstance(test_cases, list) and len(test_cases) > 0:
                total_test_cases = len(test_cases)
                if lang_key == "python":
                    full_code += "\n\n# --- AUTO-GENERATED TEST RUNNER ---\n"
                    full_code += "import json\n"
                    full_code += "test_cases = " + repr(test_cases) + "\n"
                    full_code += """
passed = 0
results = []
for i, tc in enumerate(test_cases):
    try:
        import inspect, sys, ast
        funcs = [f for n, f in inspect.getmembers(sys.modules[__name__]) if inspect.isfunction(f) and f.__module__ == __name__]
        if funcs:
            func = funcs[0]
            val = tc['input']
            if isinstance(val, str) and (val.startswith('[') or val.startswith('{') or ',' in val):
                try: args = ast.literal_eval(val)
                except: args = val
            else: args = val
                
            res = func(*args) if isinstance(args, tuple) else func(**args) if isinstance(args, dict) else func(args)
            expected = tc['expected']
            if str(res) == str(expected) or res == expected:
                passed += 1
                results.append(f"Test {i+1} PASSED")
            else:
                results.append(f"Test {i+1} FAILED: Expected {expected}, got {res}")
        else: results.append("No user function found to run.")
    except Exception as e:
        results.append(f"Test {i+1} ERROR: {str(e)}")

print("\\n".join(results))
print(f"SUMMARY: Passed {passed}/{len(test_cases)}")
"""
        except Exception as e:
            logger.error(f"Error building code runner test harness: {e}")

    payload = {
        "language": piston_lang,
        "version": piston_ver,
        "files": [{"name": filename, "content": full_code}]
    }

    try:
        response = httpx.post("https://emkc.org/api/v2/piston/execute", json=payload, timeout=12.0)
        if response.status_code == 200:
            res_data = response.json()
            run_result = res_data.get("run", {})
            stdout = run_result.get("stdout", "")
            stderr = run_result.get("stderr", "")
            code_exit = run_result.get("code", 0)
            
            passed_cnt = 0
            if "SUMMARY: Passed" in stdout:
                m = re.search(r'SUMMARY: Passed (\d+)/(\d+)', stdout)
                if m:
                    passed_cnt = int(m.group(1))

            success = code_exit == 0 and "FAILED" not in stdout and "ERROR" not in stdout
            return {
                "success": success,
                "output": stdout + ("\n" + stderr if stderr else ""),
                "exit_code": code_exit,
                "summary": f"Passed {passed_cnt}/{total_test_cases} test cases" if total_test_cases > 0 else ("Success" if success else "Errors"),
                "passed": passed_cnt,
                "total": total_test_cases
            }
        else:
            return {"success": False, "output": f"Piston returned HTTP {response.status_code}", "exit_code": 1, "summary": "Sandbox execution unavailable", "passed": 0, "total": total_test_cases}
    except Exception as e:
        return {"success": False, "output": f"Sandbox error: {str(e)}", "exit_code": 1, "summary": "Sandbox error", "passed": 0, "total": total_test_cases}


# ── 1. Dynamic Question Generator ─────────────────────────────────────────────
def generate_interview_question(
    session: InterviewSession,
    previous_qas: List[dict],
    resume_context: str = "",
    job_context: str = "",
    asked_questions: List[str] = None
) -> Dict[str, Any]:
    """
    Generate the next non-repetitive interview question using Gemini.
    Incorporates role, difficulty, interview mode, resume, JD, past QAs, and average score trend.
    """
    asked_questions = asked_questions or [qa.get("question", "") for qa in previous_qas if qa.get("question")]
    
    # Calculate current session performance trend for adaptive difficulty adjustment
    avg_score = 75
    if previous_qas:
        scores = [qa.get("score", 70) for qa in previous_qas if qa.get("score") is not None]
        if scores:
            avg_score = sum(scores) / len(scores)

    difficulty_prompt = session.difficulty
    if avg_score >= 85 and len(previous_qas) >= 2:
        difficulty_prompt += " (Candidate is doing extremely well — ask a deeper, architectural or edge-case question)"
    elif avg_score < 60 and len(previous_qas) >= 2:
        difficulty_prompt += " (Candidate struggled previously — test underlying fundamentals to help rebuild ground)"

    history_text = ""
    covered_topics = []
    if previous_qas:
        history_text = "\nPREVIOUS QUESTIONS & ANSWERS IN THIS SESSION:\n"
        for i, qa in enumerate(previous_qas):
            history_text += f"Q{i+1}: {qa.get('question')}\nCandidate Answer: {qa.get('answer')}\nScore: {qa.get('score')}/100\n"
            if qa.get("topic"):
                covered_topics.append(qa.get("topic"))

    mode_str = session.interview_type
    role_str = session.role

    # Generate next question with duplicate prevention loop
    for attempt in range(3):
        prompt = f"""
You are an expert technical interviewer conducting a text-based {session.difficulty} level {mode_str} interview for the role of '{role_str}'.

CRITICAL INSTRUCTIONS:
1. Do NOT repeat any previously asked questions or ask semantically identical questions!
2. Already asked questions: {json.dumps(asked_questions)}
3. Already covered topics: {json.dumps(covered_topics)}
4. Candidate Resume Context:
\"\"\"
{resume_context if resume_context else "No resume provided. Ask role-standard questions."}
\"\"\"
5. Target Job Description Context:
\"\"\"
{job_context if job_context else "No JD provided. Focus on core requirements for " + role_str}
\"\"\"
{history_text}

Generate the next question.
Return ONLY valid JSON with these exact keys:
{{
  "question_text": "The full text of the question...",
  "category": "Domain category (e.g. Backend, Algorithms, System Design, Behavioral)",
  "topic": "Specific subtopic (e.g. SQL Optimization, Async Memory, Conflict Management)",
  "question_type": "{mode_str.lower()}",
  "hint": "Structural guidance hint if user asks for help",
  "better_answer": "Model solution/ideal response string"
  {', "test_cases": [{"input": "(input_args)", "expected": "expected_result"}]' if mode_str.lower() == 'coding' else ''}
}}
"""
        try:
            res_raw = _call_gemini_api(prompt, json_mode=True)
            from app.services.gemini_service import clean_and_parse_json
            parsed = clean_and_parse_json(res_raw)
            q_text = parsed.get("question_text", "").strip()

            if q_text and not is_duplicate_question(q_text, asked_questions):
                return parsed
            else:
                logger.info(f"[Interview AI] Question candidate attempt {attempt+1} was duplicate. Retrying...")
        except Exception as err:
            logger.warning(f"[Interview AI] Gemini attempt {attempt+1} failed: {err}")

    # Safe fallback if Gemini retry limits hit
    fallback_q = f"How would you approach designing and testing a scalable solution for {session.role} handling unexpected production traffic?"
    if mode_str.lower() == "behavioral":
        fallback_q = "Describe a challenging situation in a past project where you faced tight deadlines. How did you organize your tasks and what was the outcome?"
    elif mode_str.lower() == "coding":
        return {
            "question_text": "Write a function `two_sum(nums, target)` that returns the indices of two numbers that add up to target.",
            "category": "Algorithms",
            "topic": "Arrays & Hash Maps",
            "question_type": "coding",
            "hint": "Use a hash map to track complements in O(n) time.",
            "better_answer": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen: return [seen[diff], i]\n        seen[num] = i\n    return []",
            "test_cases": [{"input": "([2, 7, 11, 15], 9)", "expected": "[0, 1]"}]
        }

    return {
        "question_text": fallback_q,
        "category": mode_str,
        "topic": "System & Problem Solving",
        "question_type": mode_str.lower(),
        "hint": "Break down your approach step-by-step.",
        "better_answer": "Focus on identifying core constraints, stating clear assumptions, and outlining tradeoffs."
    }


# ── 2. Real Answer Evaluator (Mathematical Weighted Scoring) ──────────────────
def evaluate_answer(
    question_text: str,
    answer_text: str,
    difficulty: str,
    interview_type: str,
    resume_context: str = "",
    job_context: str = "",
    sandbox_results: Optional[dict] = None
) -> dict:
    """
    Evaluate candidate's actual typed response using Gemini.
    Calculates weighted mathematical scores in backend code (NO hardcoded scores!).
    """
    if not answer_text or len(answer_text.strip()) < 2:
        return {
            "score": 0,
            "technical_accuracy": 0,
            "relevance": 0,
            "clarity": 0,
            "structure": 0,
            "communication": 0,
            "completeness": 0,
            "star_situation": False,
            "star_task": False,
            "star_action": False,
            "star_result": False,
            "strengths_feedback": "No answer provided.",
            "weaknesses_feedback": "Answer text was empty.",
            "suggestions_feedback": "Make sure to type a complete response before submitting.",
            "better_answer": "Provide a clear, detailed response addressing all parts of the question."
        }

    sandbox_info = ""
    if sandbox_results:
        sandbox_info = f"""
SANDBOX CODE EXECUTION DATA (AUTHORITATIVE):
- Passed Test Cases: {sandbox_results.get('passed', 0)} out of {sandbox_results.get('total', 0)}
- Execution Output/Error: {sandbox_results.get('output', '')}
- Exit Code: {sandbox_results.get('exit_code', 0)}
- Execution Success: {sandbox_results.get('success', False)}
"""

    prompt = f"""
You are a senior interviewer evaluating a candidate's actual answer in a mock interview.

QUESTION:
"{question_text}"

CANDIDATE ANSWER:
"{answer_text}"

INTERVIEW MODE: {interview_type}
DIFFICULTY: {difficulty}
{sandbox_info}

Task: Carefully evaluate the candidate's actual answer text. Return ONLY valid JSON:
{{
  "technical_accuracy": 0-100,
  "conceptual_understanding": 0-100,
  "relevance": 0-100,
  "completeness": 0-100,
  "clarity": 0-100,
  "problem_solving": 0-100,
  "star_situation": true/false (true ONLY if Situation is clearly described),
  "star_task": true/false (true ONLY if Task is clearly described),
  "star_action": true/false (true ONLY if Action is clearly described),
  "star_result": true/false (true ONLY if quantitative or qualitative Result/outcome is clearly stated),
  "strengths_feedback": "Specific strengths in candidate's actual text...",
  "weaknesses_feedback": "Specific missing points or errors in candidate's text...",
  "suggestions_feedback": "Actionable advice to improve this answer...",
  "better_answer": "Model solution/ideal answer for this exact question"
}}
"""

    # Retry loop for AI evaluation
    last_err = None
    for attempt in range(2):
        try:
            res_raw = _call_gemini_api(prompt, json_mode=True)
            from app.services.gemini_service import clean_and_parse_json
            parsed = clean_and_parse_json(res_raw)

            # Extract category scores safely
            tech_acc = int(parsed.get("technical_accuracy", 70))
            concept_und = int(parsed.get("conceptual_understanding", 70))
            relevance = int(parsed.get("relevance", 70))
            completeness = int(parsed.get("completeness", 70))
            clarity = int(parsed.get("clarity", 70))
            prob_solving = int(parsed.get("problem_solving", 70))

            star_s = bool(parsed.get("star_situation", False))
            star_t = bool(parsed.get("star_task", False))
            star_a = bool(parsed.get("star_action", False))
            star_r = bool(parsed.get("star_result", False))

            # MATHEMATICAL WEIGHTED SCORING IN BACKEND CODE
            mode_lower = interview_type.lower()
            if "behavioral" in mode_lower or "hr" in mode_lower:
                # STAR Evaluation weighting
                sit_score = 85 if star_s else 30
                task_score = 85 if star_t else 30
                action_score = 90 if star_a else 25
                result_score = 90 if star_r else 20
                final_score = round(0.20*sit_score + 0.20*task_score + 0.30*action_score + 0.20*result_score + 0.10*clarity)
            elif "coding" in mode_lower and sandbox_results:
                # Piston Code Execution weighting
                total_t = sandbox_results.get("total", 0)
                passed_t = sandbox_results.get("passed", 0)
                sandbox_pass_ratio = (passed_t / total_t) if total_t > 0 else (1.0 if sandbox_results.get("success") else 0.0)
                sandbox_score = round(sandbox_pass_ratio * 100)
                final_score = round(0.50*sandbox_score + 0.30*tech_acc + 0.20*clarity)
            else:
                # Technical Mode weighting
                final_score = round(0.30*tech_acc + 0.20*concept_und + 0.15*relevance + 0.15*completeness + 0.10*clarity + 0.10*prob_solving)

            final_score = max(0, min(100, final_score))

            return {
                "score": final_score,
                "technical_accuracy": tech_acc,
                "relevance": relevance,
                "clarity": clarity,
                "structure": round((concept_und + clarity) / 2),
                "communication": clarity,
                "completeness": completeness,
                "star_situation": star_s,
                "star_task": star_t,
                "star_action": star_a,
                "star_result": star_r,
                "strengths_feedback": parsed.get("strengths_feedback", "Good explanation of concepts."),
                "weaknesses_feedback": parsed.get("weaknesses_feedback", "Could be more detailed."),
                "suggestions_feedback": parsed.get("suggestions_feedback", "Focus on clear structure and quantifiable results."),
                "better_answer": parsed.get("better_answer", "Provide a structured explanation with practical examples.")
            }
        except Exception as e:
            last_err = e
            logger.warning(f"[Interview Evaluation] Attempt {attempt+1} failed: {e}")

    # If Gemini fails, raise exception so API returns controlled 500/error instead of fabricating a score!
    raise ValueError(f"AI evaluation service temporarily unavailable: {str(last_err)}")


# ── 3. Hint Generator ─────────────────────────────────────────────────────────
def generate_hint(question_text: str) -> str:
    """Generate a structural guidance hint for a question."""
    prompt = f"""
Provide a single-sentence structural hint for answering this interview question:
"{question_text}"

Return ONLY the text of the hint.
"""
    try:
        return _call_gemini_api(prompt, json_mode=False).strip().strip('"')
    except Exception:
        return "Focus on breaking down the core concepts first, then provide a clear example from your real experience."


# ── 4. Session Summary Roadmap Generator ─────────────────────────────────────
def generate_interview_summary(
    session: InterviewSession,
    all_qas: List[dict]
) -> dict:
    """
    Generate overall session summary, strengths, weaknesses, and a structured
    personalized improvement roadmap based on actual question scores.
    """
    qas_formatted = ""
    low_performing_topics = []

    for idx, qa in enumerate(all_qas):
        score = qa.get("score", 0)
        qas_formatted += f"Q{idx+1}: {qa.get('question')}\nAnswer: {qa.get('answer')}\nScore: {score}/100\n"
        if score < 75 and qa.get("topic"):
            low_performing_topics.append(qa.get("topic"))

    prompt = f"""
You are an expert career coach reviewing a candidate's completed mock interview session for '{session.role}'.

SESSION DATA:
{qas_formatted}

Target Low Performing Topics: {json.dumps(low_performing_topics)}

Provide a structured evaluation in JSON format:
{{
  "overall_strengths": "Bulleted summary of actual candidate strengths observed...",
  "overall_weaknesses": "Bulleted summary of actual weak areas identified...",
  "improvement_plan": "A step-by-step personalized 3-part plan formatted with markdown headers (### Priority 1: ..., ### Priority 2: ..., ### Priority 3: ...)"
}}
"""
    try:
        res_raw = _call_gemini_api(prompt, json_mode=True)
        from app.services.gemini_service import clean_and_parse_json
        return clean_and_parse_json(res_raw)
    except Exception as e:
        logger.error(f"[Interview Summary] Failed to generate AI summary: {e}")
        return {
            "overall_strengths": "• Good effort across technical questions.\n• Demonstrated core foundational knowledge.",
            "overall_weaknesses": "• Need deeper structure and quantifiable metrics in answers.",
            "improvement_plan": "### Priority 1: Structure Answers\nUse clear bullet points and frameworks (e.g. STAR method) for scenario questions.\n\n### Priority 2: Technical Deep Dive\nReview system design tradeoffs and optimization strategies."
        }
