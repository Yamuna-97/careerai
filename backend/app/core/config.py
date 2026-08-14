"""
app/core/config.py
──────────────────
Application configuration loaded from environment variables.
Pydantic Settings automatically reads from the .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """
    All configuration is read from environment variables or the .env file.
    Never hardcode credentials here.
    """

    # ── App ──────────────────────────────────────────────────────────
    APP_NAME: str = "CareerAI Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Database (Supabase PostgreSQL) ────────────────────────────────
    DATABASE_URL: str = "sqlite:///./careerai.db"  # Defaults to SQLite for local development

    # ── Supabase ──────────────────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    # JWT secret from Supabase Dashboard → Settings → API → JWT Secret
    SUPABASE_JWT_SECRET: str = ""

    # ── CORS ──────────────────────────────────────────────────────────
    # Comma-separated list of allowed frontend origins
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    # ── AI Provider (optional) ────────────────────────────────────────
    AI_PROVIDER: str = "none"   # "none" | "openai" | "gemini"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # ── Adzuna Job Search API ─────────────────────────────────────────
    # Register free at https://developer.adzuna.com
    ADZUNA_APP_ID: str = ""
    ADZUNA_APP_KEY: str = ""

    # ── Pydantic Settings ─────────────────────────────────────────────
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a Python list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Single global settings instance — import this wherever you need config
settings = Settings()
