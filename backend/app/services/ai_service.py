"""
app/services/ai_service.py
───────────────────────────
AI feature service — clean interface for future LLM integration.

Currently returns a descriptive placeholder response when no AI provider
is configured. To enable real AI features, set AI_PROVIDER and the
appropriate API key in .env.

Supported providers (to be integrated):
- openai  → set OPENAI_API_KEY
- gemini  → set GEMINI_API_KEY
"""

from dataclasses import dataclass
from app.core.config import settings


@dataclass
class AIResponse:
    success: bool
    result: str | None
    provider: str
    message: str


def _not_configured_response(feature: str) -> AIResponse:
    """Standard response when no AI provider is set up."""
    return AIResponse(
        success=False,
        result=None,
        provider="none",
        message=(
            f"AI feature '{feature}' is not yet enabled. "
            "To enable real AI features, set AI_PROVIDER=openai or AI_PROVIDER=gemini "
            "and add the corresponding API key in your .env file."
        ),
    )


def improve_summary(current_summary: str, job_title: str = "") -> AIResponse:
    """
    Improve the user's professional summary using AI.
    Plug in your LLM call here when ready.
    """
    if settings.AI_PROVIDER == "none":
        return _not_configured_response("improve-summary")

    # TODO: Implement when AI provider is configured
    # Example for OpenAI:
    # import openai
    # client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    # response = client.chat.completions.create(...)
    raise NotImplementedError("AI provider configured but not yet implemented.")


def improve_experience(description: str, company: str = "", position: str = "") -> AIResponse:
    """Improve a work experience description using AI."""
    if settings.AI_PROVIDER == "none":
        return _not_configured_response("improve-experience")
    raise NotImplementedError("AI provider configured but not yet implemented.")


def generate_project_description(project_name: str, technologies: str = "") -> AIResponse:
    """Generate a project description from project name and technologies."""
    if settings.AI_PROVIDER == "none":
        return _not_configured_response("generate-project-description")
    raise NotImplementedError("AI provider configured but not yet implemented.")


def generate_skills(job_title: str, existing_skills: list[str] = None) -> AIResponse:
    """Suggest relevant skills for a given job title."""
    if settings.AI_PROVIDER == "none":
        return _not_configured_response("generate-skills")
    raise NotImplementedError("AI provider configured but not yet implemented.")


def analyze_resume(resume_data: dict) -> AIResponse:
    """
    Deep AI analysis of the full resume.
    Returns personalized improvement suggestions.
    """
    if settings.AI_PROVIDER == "none":
        return _not_configured_response("analyze-resume")
    raise NotImplementedError("AI provider configured but not yet implemented.")
