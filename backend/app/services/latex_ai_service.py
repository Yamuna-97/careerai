"""
app/services/latex_ai_service.py
──────────────────────────────────
Gemini AI integration service for LaTeX resume transformations,
natural language editing, error fixing, and import/export flows.
"""

import json
from typing import Dict, List, Optional
from app.services import resume_ai_service


# ── Helper to Call Gemini ─────────────────────────────────────────────────────
def _call_gemini_json(prompt: str) -> dict:
    """Invokes Gemini beta API to request a validated JSON response."""
    raw = resume_ai_service._call_gemini(prompt, json_mode=True)
    return resume_ai_service._parse_json(raw)


def _call_gemini_text(prompt: str) -> str:
    """Invokes Gemini beta API to request a plain text response."""
    return resume_ai_service._call_gemini(prompt, json_mode=False)


# ── 1. CareerAI Resume Data → LaTeX ───────────────────────────────────────────
def generate_latex_from_resume(data: dict) -> str:
    """
    Convert a standard CareerAI resume JSON object into beautiful,
    well-formatted LaTeX source code.
    """
    prompt = f"""
You are an expert LaTeX typographer and resume designer.
Convert this structured resume JSON into a clean, professional, and compilable LaTeX document.

Rules:
- The LaTeX must be standard, using \\documentclass{{article}} or similar basic packages.
- Ensure all symbols like &, %, _, $, # are escaped correctly (e.g. \\&, \\%, \\_, \\$, \\#).
- Keep formatting clean, using thin lines or section spacing.
- Incorporate all details: contact, professional summary, education, experience, projects, skills, certifications, and achievements.
- Do NOT invent or add any data. Stick strictly to the input JSON content.

Input Resume JSON:
{json.dumps(data, indent=2)}

Return ONLY the plain text LaTeX source code. Do not wrap in markdown quotes or fences. Just the raw LaTeX.
"""
    raw = _call_gemini_text(prompt)
    
    # Strip markdown fences if present
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        # Remove first and last line
        cleaned = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return cleaned.strip()


# ── 2. LaTeX → CareerAI Resume Data (Import) ──────────────────────────────────
def import_latex_to_resume(latex_code: str) -> dict:
    """
    Analyze LaTeX source code and extract structured career components
    conforming to CareerAI's standard resume schema.
    """
    prompt = f"""
You are a resume parser. Parse this LaTeX resume code and extract structured information.

{resume_ai_service.SAFETY_PREAMBLE}

Return ONLY valid JSON matching this exact CareerAI resume schema:
{{
  "personal": {{
    "fullName": "string",
    "title": "string (professional title/role)",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string",
    "profileImage": ""
  }},
  "summary": "string",
  "education": [
    {{
      "id": "1",
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string",
      "endDate": "string",
      "grade": "string",
      "description": "string"
    }}
  ],
  "experience": [
    {{
      "id": "1",
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "currentlyWorking": false,
      "description": "string"
    }}
  ],
  "projects": [
    {{
      "id": "1",
      "name": "string",
      "description": "string",
      "technologies": "string (comma-separated)",
      "githubUrl": "string",
      "liveUrl": "string",
      "startDate": "string",
      "endDate": "string"
    }}
  ],
  "skills": [
    {{
      "id": "1",
      "name": "string",
      "category": "Programming Languages|Frameworks|Databases|Machine Learning|Tools|Cloud|Other"
    }}
  ],
  "certifications": [
    {{
      "id": "1",
      "name": "string",
      "issuer": "string",
      "issueDate": "string",
      "credentialUrl": "string",
      "description": "string"
    }}
  ],
  "achievements": [
    {{
      "id": "1",
      "title": "string",
      "organization": "string",
      "date": "string",
      "description": "string"
    }}
  ]
}}

LaTeX source code to parse:
---
{latex_code}
---

Return ONLY the JSON, no explanation, no markdown.
"""
    return _call_gemini_json(prompt)


# ── 3. AI Edit LaTeX Source ───────────────────────────────────────────────────
def ai_edit_latex(latex_code: str, instruction: str) -> str:
    """
    Process a natural language edit instruction and return modified LaTeX source.
    """
    prompt = f"""
You are an expert LaTeX editor. Apply this natural language command to edit the LaTeX code.

Instruction from user: "{instruction}"

{resume_ai_service.SAFETY_PREAMBLE}

Rules:
- Apply ONLY the requested edits. Keep all other formatting and code exactly the same.
- Ensure the resulting LaTeX is valid and compiles cleanly.
- Escapes should remain preserved.

Current LaTeX code:
{latex_code}

Return ONLY the updated LaTeX code. Do not wrap in markdown fences. Just the raw LaTeX.
"""
    raw = _call_gemini_text(prompt)
    
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return cleaned.strip()


# ── 4. AI Fix LaTeX Compilation Error ─────────────────────────────────────────
def ai_fix_latex_error(latex_code: str, error_msg: str, line_no: int) -> dict:
    """
    Analyze compiler logs and correct the LaTeX code at/near the error line.
    Returns JSON with updated LaTeX code and correction explanation.
    """
    prompt = f"""
You are a LaTeX debugging expert. A LaTeX resume failed to compile with this error:

Error Message: "{error_msg}"
Line Number indicated: {line_no}

Below is the LaTeX source code. Find the syntax issue (e.g. unescaped character, missing package, unmatched braces, incorrect closing tags) and correct it.

LaTeX Source:
{latex_code}

Return ONLY a valid JSON object:
{{
  "corrected_latex": "string (the complete corrected LaTeX code)",
  "explanation": "string (1-2 sentences explaining what was wrong and how you fixed it)"
}}
"""
    return _call_gemini_json(prompt)
