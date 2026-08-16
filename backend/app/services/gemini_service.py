"""
app/services/gemini_service.py
───────────────────────────────
Centralized Google Gemini AI Service.

Handles:
- Centralized model routing (Fast vs Pro) based on task type.
- Environment variable driven model selection.
- Prompt execution and HTTP communication with Google Gemini REST API.
- Safe JSON stripping & parsing.
- Central error handling and logging.

NEVER hardcode model names in frontend components or scattering model IDs.
"""

import json
import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Task to Model Routing Mapping ─────────────────────────────────────────────
AI_MODEL_TASK_MAPPING: Dict[str, str] = {
    "resume_parsing": "fast",
    "resume_analysis": "pro",
    "ats_analysis": "fast",
    "job_matching": "fast",
    "resume_tailoring": "pro",
    "resume_generation": "pro",
    "skills_recommendation": "fast",
    "bullet_improvement": "fast",
    "grammar_improvement": "fast",
    "resume_chat": "fast",
    "complex_reasoning": "pro",
}


def get_gemini_model(task: str) -> str:
    """
    Select the configured Gemini model identifier based on the operation task.
    Allows central configuration changes without modifying caller logic.
    """
    tier = AI_MODEL_TASK_MAPPING.get(task, "fast")
    if tier == "pro":
        return settings.GEMINI_PRO_MODEL or "gemini-3.5-flash-lite"
    return settings.GEMINI_FAST_MODEL or "gemini-3.5-flash-lite"


def clean_and_parse_json(raw: str) -> Dict[str, Any]:
    """
    Extract and parse structured JSON from raw LLM output,
    stripping markdown code fences (```json ... ```) if present.
    """
    if not raw or not raw.strip():
        raise ValueError("Gemini returned an empty response.")

    cleaned = raw.strip()
    # Strip markdown block wrappers if present
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        # Strip first line like ```json or ```
        start_idx = 1
        end_idx = len(lines)
        if lines[-1].strip() == "```":
            end_idx = -1
        cleaned = "\n".join(lines[start_idx:end_idx]).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as err:
        logger.error(f"[Gemini Service] Failed to parse JSON: {err}. Raw text:\n{cleaned[:300]}")
        raise ValueError(f"Invalid JSON returned from AI model: {str(err)}")


def call_gemini_api(
    prompt: str,
    task: str = "general",
    json_mode: bool = True,
    system_instruction: Optional[str] = None,
    temperature: float = 0.3,
) -> str:
    """
    Core function to communicate with Google Gemini REST API.
    Uses the task-routed model specified by get_gemini_model(task).
    """
    if not settings.GEMINI_API_KEY:
        logger.error("[Gemini Service] GEMINI_API_KEY is not set in environment.")
        raise ValueError("GEMINI_API_KEY is not configured in .env file.")

    model_name = get_gemini_model(task)
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"

    headers = {"Content-Type": "application/json"}
    params = {"key": settings.GEMINI_API_KEY}

    contents = []
    if system_instruction:
        contents.append({"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTION:\n{system_instruction}"}]})
        contents.append({"role": "model", "parts": [{"text": "Understood. I will strictly follow these instructions."}]})
    contents.append({"role": "user", "parts": [{"text": prompt}]})

    generation_config: Dict[str, Any] = {
        "temperature": temperature,
        "maxOutputTokens": 8192,
    }
    if json_mode:
        generation_config["responseMimeType"] = "application/json"

    payload = {
        "contents": contents,
        "generationConfig": generation_config,
    }

    logger.info(f"[Gemini Service] Calling task='{task}' with model='{model_name}'")

    max_retries = 3
    last_exception = None

    for attempt in range(1, max_retries + 1):
        try:
            with httpx.Client(timeout=45.0, follow_redirects=True) as client:
                response = client.post(api_url, headers=headers, params=params, json=payload)
                
                # If model identifier returns 404, retry with fallback model identifier
                if response.status_code == 404 and model_name != "gemini-3.5-flash-lite":
                    logger.warning(f"[Gemini Service] Model '{model_name}' returned 404. Retrying with fallback 'gemini-3.5-flash-lite'.")
                    fallback_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent"
                    response = client.post(fallback_url, headers=headers, params=params, json=payload)

                response.raise_for_status()
                data = response.json()

                candidates = data.get("candidates", [])
                if not candidates:
                    raise ValueError("Gemini returned no response candidates.")

                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    raise ValueError("Gemini candidate content has no text parts.")

                raw_text = parts[0].get("text", "")
                return raw_text

        except (httpx.RequestError, httpx.HTTPStatusError) as exc:
            last_exception = exc
            is_rate_limit = isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code == 429
            if is_rate_limit:
                logger.info(f"[Gemini Service] Task '{task}' rate limited (429). Attempt {attempt}/{max_retries}. Backing off...")
                if attempt < max_retries:
                    import time
                    time.sleep(2.0 * attempt)
            else:
                logger.warning(f"[Gemini Service] Attempt {attempt}/{max_retries} failed for task='{task}': {exc}.")
                if attempt < max_retries:
                    import time
                    time.sleep(1.0)
        except Exception as exc:
            last_exception = exc
            break

    logger.error(f"[Gemini Service] All {max_retries} attempts failed for task='{task}': {last_exception}")
    raise ValueError(f"Failed to communicate with Gemini API after retries: {str(last_exception)}")
