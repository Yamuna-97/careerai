"""
app/utils/helpers.py
─────────────────────
Shared utility functions used across the application.
"""

import re
from urllib.parse import urlparse


def is_valid_url(url: str) -> bool:
    """Check if a string is a valid HTTP/HTTPS URL."""
    try:
        result = urlparse(url)
        return result.scheme in ("http", "https") and bool(result.netloc)
    except Exception:
        return False


def sanitize_filename(name: str) -> str:
    """
    Convert a resume title to a safe filename for PDF downloads.
    Example: "My Resume 2024!" → "My_Resume_2024.pdf"
    """
    safe = re.sub(r"[^\w\s-]", "", name)
    safe = re.sub(r"\s+", "_", safe.strip())
    return f"{safe}.pdf" if safe else "resume.pdf"


def truncate_text(text: str, max_length: int = 200) -> str:
    """Truncate a string to max_length and add ellipsis if needed."""
    if len(text) <= max_length:
        return text
    return text[:max_length].rstrip() + "..."
