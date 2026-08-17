"""
app/services/latex_compile_service.py
──────────────────────────────────────
Secure isolated compiler for LaTeX resume projects.
Detects available LaTeX engines (pdflatex, xelatex, lualatex) on Windows/Linux,
compiles within isolated temporary directories, and returns structured errors with line numbers.
"""

import os
import re
import shutil
import subprocess
import tempfile
import base64
from typing import Dict, Tuple, List, Optional, Any


# ── Detect Available LaTeX Compilers ──────────────────────────────────────────
def get_available_compiler(preferred: Optional[str] = None) -> Optional[str]:
    """
    Detects if a LaTeX compiler executable is installed and available.
    Checks PATH and common Windows installation directories.
    """
    compilers_to_check = [preferred] if preferred else ["pdflatex", "xelatex", "lualatex"]
    compilers_to_check = [c for c in compilers_to_check if c]
    if "pdflatex" not in compilers_to_check:
        compilers_to_check.append("pdflatex")
    if "xelatex" not in compilers_to_check:
        compilers_to_check.append("xelatex")

    # 1. Check system PATH
    for comp in compilers_to_check:
        path = shutil.which(comp)
        if path:
            return comp

    # 2. Check common Windows installation paths
    common_win_dirs = [
        r"C:\Program Files\MiKTeX\miktex\bin\x64",
        r"C:\Program Files (x86)\MiKTeX\miktex\bin",
        r"C:\texlive\2024\bin\windows",
        r"C:\texlive\2023\bin\win32",
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\MiKTeX\miktex\bin\x64"),
    ]

    for win_dir in common_win_dirs:
        for comp in compilers_to_check:
            exe_path = os.path.join(win_dir, f"{comp}.exe")
            if os.path.isfile(exe_path):
                return exe_path

    return None


def is_latex_installed() -> bool:
    """Returns True if any LaTeX compiler is available on the system."""
    return get_available_compiler() is not None


# ── Error Parsing ─────────────────────────────────────────────────────────────
def parse_latex_errors(log_text: str) -> List[Dict[str, Any]]:
    """
    Parse stderr and stdout logs for LaTeX compilation errors and line numbers.
    """
    errors = []

    # Format: ! Undefined control sequence. \nl.42 \cvevent
    pattern = re.compile(r'^!\s+(.*?)\n(?:.*?\n)*?l\.(\d+)\s*(.*?)$', re.MULTILINE | re.DOTALL)
    for match in pattern.finditer(log_text):
        desc = match.group(1).replace('\n', ' ').strip()
        line = int(match.group(2))
        context = match.group(3).strip()
        errors.append({
            "severity": "error",
            "line": line,
            "message": desc,
            "context": context
        })

    # Fallback format: ./cv.tex:42: Undefined control sequence
    if not errors:
        pattern2 = re.compile(r'^([\w\.\/\-]+):(\d+):\s+(.*?)$', re.MULTILINE)
        for match in pattern2.finditer(log_text):
            line = int(match.group(2))
            desc = match.group(3).strip()
            errors.append({
                "severity": "error",
                "line": line,
                "message": desc,
                "context": ""
            })

    return errors


# ── LaTeX Sandbox Sandbox Compiler ───────────────────────────────────────────
def compile_latex(files: Dict[str, str], compiler: str = "pdflatex") -> Tuple[bool, bytes, str, List[Dict[str, Any]]]:
    """
    Compile a dictionary of LaTeX project files into a PDF binary.
    Files keys are relative paths (e.g. cv.tex, altacv.cls, images/avatar.jpg).
    Returns: (success_bool, pdf_bytes, log_output, parsed_errors_list)
    """
    # Filename sanitization pattern (prevent path traversal outside sandbox)
    def is_safe_path(path: str) -> bool:
        if ".." in path or path.startswith("/") or path.startswith("\\"):
            return False
        return bool(re.match(r'^[\w\/\.\-\ ]+$', path))

    # Detect compiler executable
    active_compiler = get_available_compiler(preferred=compiler)
    if not active_compiler:
        msg = (
            "LaTeX compiler (pdflatex / xelatex) is not installed on this system. "
            "Please install MiKTeX (https://miktex.org) or TeX Live to compile LaTeX resume templates."
        )
        errors = [{
            "severity": "error",
            "line": 1,
            "message": msg,
            "context": "System environment error"
        }]
        return False, b"", msg, errors

    # Create temporary isolated compilation workspace
    temp_dir = tempfile.mkdtemp(prefix="latex_comp_")
    log_text = ""
    pdf_bytes = b""
    success = False
    errors = []

    try:
        # Write files into sandbox
        for rel_path, file_content in files.items():
            if not is_safe_path(rel_path):
                continue

            full_file_path = os.path.join(temp_dir, rel_path)
            os.makedirs(os.path.dirname(full_file_path), exist_ok=True)

            if rel_path.lower().endswith((".png", ".jpg", ".jpeg", ".pdf")):
                try:
                    decoded_bytes = base64.b64decode(file_content)
                    with open(full_file_path, "wb") as f:
                        f.write(decoded_bytes)
                except Exception:
                    with open(full_file_path, "w", encoding="utf-8", errors="ignore") as f:
                        f.write(file_content)
            else:
                with open(full_file_path, "w", encoding="utf-8") as f:
                    f.write(file_content)

        main_file = "cv.tex"
        if not os.path.exists(os.path.join(temp_dir, main_file)):
            raise FileNotFoundError("Main LaTeX file 'cv.tex' is missing in project files.")

        cmd = [
            active_compiler,
            "-interaction=nonstopmode",
            "-halt-on-error",
            "-file-line-error",
            main_file
        ]

        # Execute in isolated temporary directory with timeout limit
        proc = subprocess.run(
            cmd,
            cwd=temp_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=12.0
        )

        log_text = proc.stdout + "\n" + proc.stderr

        pdf_path = os.path.join(temp_dir, "cv.pdf")
        if os.path.exists(pdf_path) and proc.returncode == 0:
            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()
            success = True
        else:
            success = False
            errors = parse_latex_errors(log_text)
            if not errors:
                errors.append({
                    "severity": "error",
                    "line": 1,
                    "message": "LaTeX compilation failed. Review the compiler output for syntax details.",
                    "context": log_text[:300]
                })

    except subprocess.TimeoutExpired:
        log_text = "[✕] Compilation Timed Out (exceeded 12.0 seconds)."
        errors = [{
            "severity": "error",
            "line": 1,
            "message": "LaTeX compilation timed out.",
            "context": ""
        }]
        success = False
    except Exception as e:
        log_text = f"[✕] Compilation system error: {str(e)}"
        errors = [{
            "severity": "error",
            "line": 1,
            "message": str(e),
            "context": ""
        }]
        success = False
    finally:
        # Securely remove temporary compilation sandbox
        shutil.rmtree(temp_dir, ignore_errors=True)

    return success, pdf_bytes, log_text, errors
