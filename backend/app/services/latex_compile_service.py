"""
app/services/latex_compile_service.py
──────────────────────────────────────
Secure sandbox compiler for LaTeX resume code.

If pdflatex is installed on the host machine, compiles using pdflatex
with restricted timeouts, isolated directories, and sanitized filenames.
If pdflatex is not found, dynamically parses the LaTeX code and renders
a clean, professional PDF using ReportLab as a fallback compiler.
"""

import os
import io
import re
import shlex
import shutil
import subprocess
import tempfile
import base64
from typing import Dict, Tuple, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Check if pdflatex is available in PATH
def is_latex_installed() -> bool:
    return shutil.which("pdflatex") is not None


# ── ReportLab LaTeX Fallback Parser ───────────────────────────────────────────
def compile_latex_fallback(latex_code: str) -> Tuple[bool, bytes, str]:
    """
    Parses key elements from LaTeX resume source code using regex,
    and renders them as a high-fidelity PDF document using ReportLab.
    Returns: (success_bool, pdf_bytes, log_string)
    """
    logs = [
        "[*] pdflatex compiler not found in system PATH.",
        "[*] Running in Sandbox Mock PDF Compiler Mode (powered by ReportLab)."
    ]

    try:
        # 1. Clean LaTeX comments
        cleaned_code = re.sub(r'(?<!\\)%.*$', '', latex_code, flags=re.MULTILINE)

        # 2. Extract Name
        name = "Your Name"
        name_match = re.search(r'\\begin{center}\s*\\(?:LARGE|Large|Huge|huge|LARGE\\textbf|Large\\textbf)\s*\{?([^}]+)\}?', cleaned_code)
        if not name_match:
            name_match = re.search(r'\\name\{([^}]+)\}', cleaned_code)
        if not name_match:
            name_match = re.search(r'\\title\{([^}]+)\}', cleaned_code)
        if name_match:
            name = name_match.group(1).replace('\\textbf', '').replace('\\large', '').strip()

        # 3. Extract contact info
        emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', cleaned_code)
        phones = re.findall(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', cleaned_code)
        links = re.findall(r'(?:linkedin\.com/in/|github\.com/)[\w\.-]+', cleaned_code)

        contact_parts = []
        if emails: contact_parts.append(emails[0])
        if phones: contact_parts.append(phones[0])
        if links: contact_parts.extend(links)
        contact_str = " | ".join(contact_parts) if contact_parts else "Email | Phone | Location | LinkedIn"

        logs.append(f"[+] Parsed candidate name: '{name}'")
        logs.append(f"[+] Parsed contact details: '{contact_str}'")

        # 4. Extract sections
        # Match sections e.g. \section*{Summary} ... next \section
        section_matches = list(re.finditer(r'\\section\*?\{([^}]+)\}', cleaned_code))
        sections_data = []

        for i, match in enumerate(section_matches):
            section_title = match.group(1).strip()
            start_pos = match.end()
            end_pos = section_matches[i + 1].start() if i < len(section_matches) - 1 else len(cleaned_code)
            
            section_content = cleaned_code[start_pos:end_pos].strip()
            # Remove trailing \end{document} or other closing commands
            section_content = re.sub(r'\\end\{document\}', '', section_content)
            sections_data.append((section_title, section_content))

        # 5. Build ReportLab PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54
        )

        styles = getSampleStyleSheet()
        story = []

        # Color palette
        primary_color = colors.HexColor("#4F46E5") # Indigo
        dark_color = colors.HexColor("#1E293B") # Slate 800
        muted_color = colors.HexColor("#64748B") # Slate 500

        # Styles
        name_style = ParagraphStyle("Name", fontName="Helvetica-Bold", fontSize=22, textColor=primary_color, alignment=TA_CENTER, spaceAfter=4)
        contact_style = ParagraphStyle("Contact", fontName="Helvetica", fontSize=9, textColor=muted_color, alignment=TA_CENTER, spaceAfter=15)
        section_title_style = ParagraphStyle("SecTitle", fontName="Helvetica-Bold", fontSize=12, textColor=primary_color, spaceBefore=10, spaceAfter=6)
        body_style = ParagraphStyle("BodyText", fontName="Helvetica", fontSize=9, textColor=dark_color, leading=13, spaceAfter=4)
        bullet_style = ParagraphStyle("BulletText", fontName="Helvetica", fontSize=9, textColor=dark_color, leading=13, leftIndent=15, bulletIndent=5, spaceAfter=3)

        # Render Header
        story.append(Paragraph(name, name_style))
        story.append(Paragraph(contact_str, contact_style))

        # Render Sections
        for title, content in sections_data:
            story.append(Paragraph(title, section_title_style))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceAfter=8))
            
            # Clean content commands
            # Process itemized list
            lines = content.split("\n")
            in_list = False
            
            for line in lines:
                line_str = line.strip()
                if not line_str:
                    continue
                if "\\begin{itemize}" in line_str:
                    in_list = True
                    continue
                if "\\end{itemize}" in line_str:
                    in_list = False
                    continue

                # Strip common LaTeX commands
                clean_line = re.sub(r'\\item\s*', '', line_str)
                clean_line = re.sub(r'\\textbf\{([^}]+)\}', r'<b>\1</b>', clean_line)
                clean_line = re.sub(r'\\textit\{([^}]+)\}', r'<i>\1</i>', clean_line)
                clean_line = re.sub(r'\\textsf\{([^}]+)\}', r'\1', clean_line)
                clean_line = re.sub(r'\\hfill', '  ', clean_line)
                clean_line = re.sub(r'\\char`\\~', '~', clean_line)
                clean_line = re.sub(r'\\[\w]+(?:\[[^\]]*\])?(?:\{[^\}]*\})*', '', clean_line) # Strip other commands
                clean_line = clean_line.replace('\\&', '&').replace('\\_', '_').replace('\\%', '%').replace('{', '').replace('}', '').strip()

                if not clean_line:
                    continue

                if in_list or line_str.startswith("\\item"):
                    story.append(Paragraph(f"&bull; {clean_line}", bullet_style))
                else:
                    story.append(Paragraph(clean_line, body_style))
            story.append(Spacer(1, 8))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        
        logs.append("[✓] Fallback compilation finished successfully. PDF rendered.")
        return True, pdf_bytes, "\n".join(logs)

    except Exception as e:
        logs.append(f"[✕] Fallback compiler failed: {str(e)}")
        return False, b"", "\n".join(logs)


# ── LaTeX Sandbox Sandbox Compiler ───────────────────────────────────────────
def compile_latex(files: Dict[str, str], compiler: str = "pdflatex") -> Tuple[bool, bytes, str, List[Dict]]:
    """
    Compile a dictionary of LaTeX project files into a PDF binary.
    Files keys are relative paths (e.g. cv.tex, images/avatar.jpg).
    Returns: (success_bool, pdf_bytes, log_output, parsed_errors_list)
    """
    # Filename sanitization pattern (prevent traversal outside directory)
    def is_safe_path(path: str) -> bool:
        if ".." in path or path.startswith("/") or path.startswith("\\"):
            return False
        return bool(re.match(r'^[\w\/\.\-\ ]+$', path))

    # Parse stderr/stdout logs for LaTeX compile errors
    def parse_latex_errors(log_text: str) -> List[Dict]:
        errors = []
        # Find e.g. ! Undefined control sequence. \nl l.12
        # Or ! Paragraph ended before \multispan was complete. l.45
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
        
        # Simple fallback error finder if log has file line details e.g. ./cv.tex:10: Undefined control sequence
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

    # Check if pdflatex is installed
    if not is_latex_installed():
        # Retrieve fall back ReportLab compiling outcome
        cv_content = files.get("cv.tex", "")
        success, pdf_bytes, log_text = compile_latex_fallback(cv_content)
        parsed_errs = []
        if not success:
            parsed_errs = [{"severity": "error", "line": 1, "message": "Fallback ReportLab compilation failed.", "context": ""}]
        return success, pdf_bytes, log_text, parsed_errs

    # Create temporary compilation workspace
    temp_dir = tempfile.mkdtemp(prefix="latex_comp_")
    log_text = ""
    pdf_bytes = b""
    success = False
    errors = []

    try:
        # Write files
        for rel_path, file_content in files.items():
            if not is_safe_path(rel_path):
                continue
            
            full_file_path = os.path.join(temp_dir, rel_path)
            # Create folder structures if needed
            os.makedirs(os.path.dirname(full_file_path), exist_ok=True)
            
            # Write binary or text
            if rel_path.endswith((".png", ".jpg", ".jpeg", ".pdf")):
                try:
                    # Attempt base64 decode if binary
                    decoded_bytes = base64.b64decode(file_content)
                    with open(full_file_path, "wb") as f:
                        f.write(decoded_bytes)
                except Exception:
                    # Write raw string if fails
                    with open(full_file_path, "w", encoding="utf-8") as f:
                        f.write(file_content)
            else:
                with open(full_file_path, "w", encoding="utf-8") as f:
                    f.write(file_content)

        # Run compiler inside directory (must be safe sandbox)
        cmd_compiler = "pdflatex" if compiler.lower() == "pdflatex" else "xelatex"
        main_file = "cv.tex"
        
        # Verify cv.tex exists
        if not os.path.exists(os.path.join(temp_dir, main_file)):
            raise FileNotFoundError("Main LaTeX file 'cv.tex' is missing.")

        cmd = [
            cmd_compiler,
            "-interaction=nonstopmode",
            "-halt-on-error",
            "-file-line-error",
            main_file
        ]

        # Execute with 6-second timeout limit
        proc = subprocess.run(
            cmd,
            cwd=temp_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=6.0
        )

        log_text = proc.stdout + "\n" + proc.stderr
        
        # Read compiled PDF bytes
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
                    "message": "LaTeX compilation failed. Check logs for details.",
                    "context": log_text[:200]
                })

    except subprocess.TimeoutExpired:
        log_text = "[✕] Compilation Timed Out (exceeded limit of 6.0 seconds)."
        errors = [{"severity": "error", "line": 1, "message": "Compilation Timed Out.", "context": ""}]
        success = False
    except Exception as e:
        log_text = f"[✕] Compilation system error: {str(e)}"
        errors = [{"severity": "error", "line": 1, "message": str(e), "context": ""}]
        success = False
    finally:
        # Clean up temporary folder
        shutil.rmtree(temp_dir, ignore_errors=True)

    return success, pdf_bytes, log_text, errors
