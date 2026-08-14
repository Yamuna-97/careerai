"""
app/services/interview_ai_service.py
────────────────────────────────────
Gemini AI integration service for generating mock interview questions,
adaptive follow-ups, hints, evaluations, and improvement roadmaps.

Includes a secure sandbox code execution runner using the Piston API.
"""

import httpx
import json
from typing import List, Optional
from app.core.config import settings
from app.models.interview import InterviewSession, InterviewQuestion

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"


# ── Internal Helper to Call Gemini ────────────────────────────────────────────
def _call_gemini_api(prompt: str, json_mode: bool = True) -> str:
    """Helper to perform HTTP POST to Google Gemini API."""
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not configured.")

    headers = {"Content-Type": "application/json"}
    params = {"key": settings.GEMINI_API_KEY}

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {}
    }

    if json_mode:
        payload["generationConfig"]["responseMimeType"] = "application/json"

    try:
        response = httpx.post(GEMINI_API_URL, headers=headers, params=params, json=payload, timeout=20.0)
        response.raise_for_status()
        data = response.json()
        
        candidates = data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts:
                return parts[0].get("text", "")
        raise ValueError("Invalid response format received from Gemini.")
    except Exception as e:
        print(f"Error communicating with Gemini API: {str(e)}")
        raise


# ── Secure Code Execution Sandbox (Piston API) ────────────────────────────────
def run_code_in_sandbox(language: str, code: str, test_cases_json: Optional[str] = None) -> dict:
    """
    Execute code securely using the public Piston sandbox API.
    Runs the code against test cases if provided, and returns execution result.
    """
    if not code:
        return {"success": False, "output": "No code submitted.", "exit_code": 1, "summary": "Empty solution"}

    # Map frontend languages to Piston identifiers
    lang_map = {
        "python": {"language": "python", "version": "3.10.0", "filename": "solution.py"},
        "javascript": {"language": "javascript", "version": "18.15.0", "filename": "solution.js"},
        "java": {"language": "java", "version": "15.0.2", "filename": "Main.java"},
        "cpp": {"language": "c++", "version": "10.2.0", "filename": "main.cpp"}
    }

    lang_key = language.lower().strip()
    if lang_key not in lang_map:
        lang_key = "python"  # Default

    piston_lang = lang_map[lang_key]["language"]
    piston_ver = lang_map[lang_key]["version"]
    filename = lang_map[lang_key]["filename"]

    full_code = code
    if test_cases_json:
        try:
            test_cases = json.loads(test_cases_json)
            if isinstance(test_cases, list) and len(test_cases) > 0:
                if lang_key == "python":
                    full_code += "\n\n# --- AUTO-GENERATED TEST RUNNER ---\n"
                    full_code += "import json\n"
                    full_code += "test_cases = " + repr(test_cases) + "\n"
                    full_code += """
passed = 0
results = []
for i, tc in enumerate(test_cases):
    try:
        import inspect
        import sys
        import ast
        funcs = [f for n, f in inspect.getmembers(sys.modules[__name__]) if inspect.isfunction(f) and f.__module__ == __name__]
        if funcs:
            func = funcs[0]
            val = tc['input']
            if isinstance(val, str) and (val.startswith('[') or val.startswith('{') or ',' in val):
                try:
                    args = ast.literal_eval(val)
                except:
                    args = val
            else:
                args = val
                
            if isinstance(args, tuple):
                res = func(*args)
            elif isinstance(args, dict):
                res = func(**args)
            else:
                res = func(args)
                
            expected = tc['expected']
            if str(res) == str(expected) or res == expected:
                passed += 1
                results.append(f"Test {i+1} PASSED")
            else:
                results.append(f"Test {i+1} FAILED: Expected {expected}, got {res}")
        else:
            results.append("No user function found to run.")
    except Exception as e:
        results.append(f"Test {i+1} ERROR: {str(e)}")

print("\\n".join(results))
print(f"SUMMARY: Passed {passed}/{len(test_cases)}")
"""
                elif lang_key == "javascript":
                    full_code += "\n\n// --- AUTO-GENERATED TEST RUNNER ---\n"
                    full_code += "const testCases = " + json.dumps(test_cases) + ";\n"
                    full_code += """
let passed = 0;
const results = [];
testCases.forEach((tc, i) => {
    try {
        // Find custom function
        const globalFuncs = Object.keys(global).filter(k => typeof global[k] === 'function');
        const custom = Object.keys(global).find(k => k !== 'setTimeout' && k !== 'setInterval' && typeof global[k] === 'function');
        const func = global[custom];
        if (func) {
            let args;
            try {
                args = JSON.parse(tc.input);
            } catch(e) {
                args = tc.input;
            }
            const res = Array.isArray(args) ? func(...args) : func(args);
            const expected = tc.expected;
            if (String(res) === String(expected) || JSON.stringify(res) === JSON.stringify(expected)) {
                passed++;
                results.push(`Test ${i+1} PASSED`);
            } else {
                results.push(`Test ${i+1} FAILED: Expected {expected}, got {res}`);
            }
        } else {
            results.push("No user function found.");
        }
    } catch(e) {
        results.push(`Test {i+1} ERROR: ${e.message}`);
    }
});
console.log(results.join("\\n"));
console.log(`SUMMARY: Passed ${passed}/${testCases.length}`);
"""
        except Exception as e:
            print(f"Error creating sandbox test runner: {e}")

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
            
            success = code_exit == 0 and not stderr
            summary_msg = "Passed test cases!" if success else "Execution complete with errors."
            if "SUMMARY: Passed" in stdout:
                raw_summary = stdout.split("SUMMARY: Passed")[-1].strip()
                summary_msg = f"Passed {raw_summary}"
                
            return {
                "success": success and "FAILED" not in stdout and "ERROR" not in stdout,
                "output": stdout + "\n" + stderr,
                "exit_code": code_exit,
                "summary": summary_msg
            }
        else:
            return {"success": False, "output": f"Piston execution service returned HTTP {response.status_code}", "exit_code": 1, "summary": "Sandbox execution unavailable"}
    except Exception as e:
        return {"success": False, "output": f"Failed to execute code in sandbox: {str(e)}", "exit_code": 1, "summary": "Sandbox execution error"}


# ── 1. Question Generator ──────────────────────────────────────────────────────
def generate_interview_question(
    session: InterviewSession,
    previous_qas: List[dict],
    resume_context: str = "",
    job_context: str = ""
) -> str:
    """
    Generate the next interview question using Gemini.
    Incorporates difficulty, interview type, target role, and adaptive follow-up context.
    """
    # Special flow for Coding Interview Mode
    if session.interview_type.lower() == "coding":
        prompt = f"""
        You are an expert technical interviewer conducting a {session.difficulty} difficulty CODING interview for the role of '{session.role}' on the topic of '{session.topic or "Arrays"}'.
        Generate a coding challenge appropriate for the programming language '{session.language or "python"}'.

        Return a JSON object with:
        - "question_text": The problem statement including task details, constraints, and an example.
        - "hint": A short guiding hint for a candidate struggling with this.
        - "better_answer": A high-quality model implementation in the target language.
        - "test_cases": A JSON array of 3 test cases. Each test case must be: {{ "input": "input_string", "expected": "expected_result_string" }}
        
        Ensure the output is a single, valid JSON block.
        """
        if settings.GEMINI_API_KEY:
            try:
                res_text = _call_gemini_api(prompt, json_mode=True)
                return res_text
            except Exception:
                pass

        # Fallback Coding Challenges
        fallbacks = {
            "Arrays": {
                "question_text": "Write a function `two_sum(nums, target)` that returns the indices of the two numbers such that they add up to the target. Example: nums=[2,7,11,15], target=9 -> [0,1].",
                "hint": "Try using a hash map to look up elements in O(1) time.",
                "better_answer": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
                "test_cases": [
                    {"input": "([2, 7, 11, 15], 9)", "expected": "[0, 1]"},
                    {"input": "([3, 2, 4], 6)", "expected": "[1, 2]"},
                    {"input": "([3, 3], 6)", "expected": "[0, 1]"}
                ]
            },
            "Strings": {
                "question_text": "Write a function `is_palindrome(s)` that returns true if a string reads the same forward and backward, ignoring non-alphanumeric characters. Example: 'A man, a plan, a canal: Panama' -> true.",
                "hint": "Use two pointers starting from the beginning and end, moving towards the center.",
                "better_answer": "def is_palindrome(s):\n    cleaned = [c.lower() for c in s if c.isalnum()]\n    return cleaned == cleaned[::-1]",
                "test_cases": [
                    {"input": "'A man, a plan, a canal: Panama'", "expected": "True"},
                    {"input": "'race a car'", "expected": "False"},
                    {"input": "' '", "expected": "True"}
                ]
            },
            "Sorting": {
                "question_text": "Write a function `merge_sorted_arrays(arr1, arr2)` that takes two sorted integer arrays and merges them into one sorted array. Example: [1,3,5], [2,4,6] -> [1,2,3,4,5,6].",
                "hint": "Use two index pointers to traverse both arrays and append the smaller value.",
                "better_answer": "def merge_sorted_arrays(arr1, arr2):\n    res = []\n    i = j = 0\n    while i < len(arr1) and j < len(arr2):\n        if arr1[i] < arr2[j]:\n            res.append(arr1[i])\n            i += 1\n        else:\n            res.append(arr2[j])\n            j += 1\n    res.extend(arr1[i:])\n    res.extend(arr2[j:])\n    return res",
                "test_cases": [
                    {"input": "([1, 3, 5], [2, 4, 6])", "expected": "[1, 2, 3, 4, 5, 6]"},
                    {"input": "([], [1, 2])", "expected": "[1, 2]"},
                    {"input": "([5], [2])", "expected": "[2, 5]"}
                ]
            }
        }
        topic_key = session.topic if session.topic in fallbacks else "Arrays"
        return json.dumps(fallbacks[topic_key])

    # Standard Text Interview Mode
    prompt = f"""
    You are an expert interviewer conducting a {session.difficulty} difficulty {session.interview_type} mock interview for the role of '{session.role}'.
    Format the output as a single interview question.

    CONTEXT:
    - Target Role: {session.role}
    - Difficulty Level: {session.difficulty} (Beginner: basic questions with guided hints. Intermediate: moderate technical & STAR behavioral. Pro: system design, pressure questioning, strict follow-ups.)
    """

    if resume_context:
        prompt += f"\n- User Resume Context:\n{resume_context}"
    if job_context or (session.job_company and session.job_description):
        prompt += f"\n- Target Job: {session.job_title} at {session.job_company}\nJob Description:\n{session.job_description or job_context}"

    if previous_qas:
        prompt += "\n\nHISTORY OF PREVIOUS QUESTIONS & ANSWERS IN THIS SESSION:\n"
        for i, qa in enumerate(previous_qas):
            prompt += f"Q{i+1}: {qa['question']}\nA{i+1}: {qa['answer']}\n"
        prompt += "\nBased on the history above, generate a follow-up or next logical question. Respond to their last answer naturally. Do not repeat previous questions."
    else:
        prompt += "\nThis is the first question of the interview. Start with an appropriate introductory or initial technical question based on the role and difficulty."

    prompt += "\n\nReturn ONLY the text of the question. Do not add any greeting, intro, conversational filler, or formatting."

    # Live Call
    if settings.GEMINI_API_KEY:
        try:
            return _call_gemini_api(prompt, json_mode=False).strip().strip('"')
        except Exception:
            pass

    # High-quality fallback questions
    fallback_questions = {
        "beginner": [
            "Can you tell me about yourself and your background in engineering?",
            "What is the difference between an API and a web service?",
            "You mentioned Python on your resume. What is the difference between a list and a tuple?",
            "Describe a project you worked on recently. What was your role?"
        ],
        "intermediate": [
            "Why did you choose FastAPI over Flask or Django for your APIs?",
            "Describe a time you had to deal with a conflicting priority within a team. How did you resolve it?",
            "What is regularization in machine learning? How do L1 and L2 regularization differ?",
            "How do you handle feature engineering when working with high-dimensional datasets?"
        ],
        "pro": [
            "Design a real-time recommendation pipeline for an e-commerce platform with 10M active users. How do you handle cold starts?",
            "Explain how you would optimize a deep learning model for real-time inference on edge devices without losing significant accuracy.",
            "You mentioned YOLO in your farm monitoring project. How did you structure the training pipeline, and how did you measure and address model bias?",
            "How would you architect a database synchronization system between a client-side SQL DB and a remote Supabase PostgreSQL backend under flaky networks?"
        ]
    }
    
    idx = len(previous_qas) % 4
    level = session.difficulty.lower()
    if level not in fallback_questions:
        level = "intermediate"
    return fallback_questions[level][idx]


# ── 2. Answer Evaluation ──────────────────────────────────────────────────────
def evaluate_answer(
    question_text: str,
    answer_text: str,
    difficulty: str,
    interview_type: str,
    sandbox_results: Optional[dict] = None
) -> dict:
    """
    Evaluate the user's answer using Gemini.
    Returns scores, STAR breakdown, strengths, weaknesses, suggestions, and a better example answer.
    """
    sandbox_info = ""
    if sandbox_results:
        sandbox_info = f"""
        CODE EXECUTION RESULTS IN SECURE SANDBOX:
        - Output/Error: {sandbox_results.get("output")}
        - Test Case Summary: {sandbox_results.get("summary")}
        - Success: {sandbox_results.get("success")}
        """

    prompt = f"""
    You are an expert interviewer evaluating a candidate's answer in a mock interview.
    
    Evaluate the following response:
    - Question: "{question_text}"
    - Candidate Answer: "{answer_text}"
    - Interview Category: {interview_type}
    - Difficulty: {difficulty}
    {sandbox_info}

    Provide a structured evaluation in JSON format with the following keys:
    - "score" (integer, 0 to 100)
    - "technical_accuracy" (integer, 0 to 100)
    - "relevance" (integer, 0 to 100)
    - "clarity" (integer, 0 to 100)
    - "structure" (integer, 0 to 100)
    - "communication" (integer, 0 to 100)
    - "completeness" (integer, 0 to 100)
    - "star_situation" (boolean: true if Situation is clearly described, else false)
    - "star_task" (boolean: true if Task is clearly described, else false)
    - "star_action" (boolean: true if Action is clearly described, else false)
    - "star_result" (boolean: true if quantitative/qualitative Result is clearly described, else false)
    - "strengths_feedback" (string summary of strengths)
    - "weaknesses_feedback" (string summary of weaknesses)
    - "suggestions_feedback" (concrete tips for improvement)
    - "better_answer" (a highly professional, strong model answer for this question)

    Ensure the output is valid, parsable JSON.
    """

    if settings.GEMINI_API_KEY:
        try:
            res_text = _call_gemini_api(prompt, json_mode=True)
            return json.loads(res_text)
        except Exception:
            pass

    # High-quality fallback evaluation generator
    is_star_related = "behavioral" in interview_type.lower() or "hr" in interview_type.lower() or "tell me" in question_text.lower()
    
    score = 82
    if sandbox_results and not sandbox_results.get("success"):
        score = 45  # Penalize failing code

    return {
        "score": score,
        "technical_accuracy": 85 if score > 50 else 40,
        "relevance": 88,
        "clarity": 80,
        "structure": 78,
        "communication": 82,
        "completeness": 80,
        "star_situation": True,
        "star_task": True,
        "star_action": True,
        "star_result": False if is_star_related else True,
        "strengths_feedback": "Solid answer structure, good explanation of the core technical concept." if score > 50 else "Attempted the challenge but has syntax/runtime test errors.",
        "weaknesses_feedback": "Could explain tradeoffs better or fix failing tests." if score > 50 else "The code has compilation issues or failed test cases.",
        "suggestions_feedback": "Review optimization patterns or corner cases." if score > 50 else "Check the logic for null inputs, array indexing bounds, and double check variable assignments.",
        "better_answer": "Model Solution:\n" + (sandbox_results.get("summary") if sandbox_results else "Focus on writing clean modular code using descriptive variable names and verifying constraints.")
    }


# ── 3. Hint Generator ─────────────────────────────────────────────────────────
def generate_hint(question_text: str) -> str:
    """Generate a helpful STAR or technical guide hint for a question."""
    prompt = f"""
    Give a single-sentence helpful hint or structural prompt for answering this interview question:
    Question: "{question_text}"
    
    Return only the text of the hint.
    """

    if settings.GEMINI_API_KEY:
        try:
            return _call_gemini_api(prompt, json_mode=False).strip().strip('"')
        except Exception:
            pass

    if "conflict" in question_text.lower() or "describe a time" in question_text.lower():
        return "Recall the STAR structure: focus on a specific team situation, the task required, the action you initiated, and the positive team result."
    return "Explain the fundamental concepts first, name the frameworks involved, and mention a practical example from your experience."


# ── 4. Session Summary Roadmap Generator ─────────────────────────────────────
def generate_interview_summary(
    session: InterviewSession,
    all_qas: List[dict]
) -> dict:
    """
    Generate overall session summary, strengths, weaknesses, and a structured
    personalized improvement roadmap.
    """
    qas_formatted = ""
    for idx, qa in enumerate(all_qas):
        qas_formatted += f"Q{idx+1}: {qa['question']}\nA{idx+1}: {qa['answer']}\nScore: {qa['score']}/100\n"

    prompt = f"""
    You are an expert career coach reviewing a candidate's completed mock interview session for the role of '{session.role}'.
    
    Based on the session history:
    {qas_formatted}
    
    Provide an overall structured evaluation in JSON format containing:
    - "overall_strengths" (bulleted text describing core strengths)
    - "overall_weaknesses" (bulleted text describing key weaknesses)
    - "improvement_plan" (a step-by-step 3-part plan formatted with headers like '### Priority 1', '### Priority 2', etc.)

    Ensure the response is valid, parsable JSON.
    """

    if settings.GEMINI_API_KEY:
        try:
            res_text = _call_gemini_api(prompt, json_mode=True)
            return json.loads(res_text)
        except Exception:
            pass

    return {
        "overall_strengths": "• Clear conceptual understanding of engineering pipelines and architecture.\n• Good communication clarity and logical flow.\n• Strong problem solving mindset.",
        "overall_weaknesses": "• Lacks quantitative details in explanations.\n• Missing STAR result outputs (outlining percentage efficiency gains, metrics, etc.).\n• Needs more structured approach to answering open-ended system design questions.",
        "improvement_plan": "### Priority 1: Answer Structuring\nUse the **STAR Method** for behavioral questions. Ensure you spend 15% on Situation/Task, 50% detailing your Actions, and 35% on the quantitative Result.\n\n### Priority 2: Technical Depth & Optimization\nPractice detailing latency profiles, data flows, asynchronous processing queues (like Celery/Redis), and deployment architectures.\n\n### Priority 3: Communication Speed\nKeep your technical explanations concise. Focus on high-level tradeoffs before diving deep into implementation details."
    }
