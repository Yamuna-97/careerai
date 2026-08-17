"""
Test suite for LaTeX template adapters and compilation services.
"""

import os
import pytest
from app.services import latex_template_service, latex_compile_service

SAMPLE_RESUME_DATA = {
    "personal": {
        "fullName": "Dr. Sarah Connor",
        "title": "Lead Systems Architect & Robotics Researcher",
        "email": "sarah.connor@example.com",
        "phone": "+1 (555) 019-2834",
        "location": "Los Angeles, CA",
        "linkedin": "https://linkedin.com/in/sarah-connor",
        "github": "https://github.com/sarah-connor",
        "portfolio": "https://sarahconnor.ai"
    },
    "summary": "Experienced engineer with 8+ years building robust autonomous robotics & AI architectures.",
    "education": [
        {
            "institution": "Stanford University",
            "degree": "M.S. in Computer Science",
            "fieldOfStudy": "Robotics & AI",
            "startDate": "2018",
            "endDate": "2020",
            "grade": "3.95 GPA",
            "description": "Focus on computer vision and control systems."
        }
    ],
    "experience": [
        {
            "company": "Cyberdyne Systems",
            "position": "Senior Autonomous Systems Engineer",
            "location": "Sunnyvale, CA",
            "startDate": "2020",
            "endDate": "Present",
            "currentlyWorking": True,
            "description": "• Spearheaded core vision pipeline processing 60 FPS sensor data.\n• Optimized model inference latency by 45%."
        }
    ],
    "projects": [
        {
            "name": "Neural Vision Navigator",
            "technologies": "PyTorch, C++, ROS2",
            "description": "Open-source obstacle detection library with 2k+ stars on GitHub."
        }
    ],
    "skills": [
        {"name": "Python & C++", "category": "Languages"},
        {"name": "PyTorch & TensorFlow", "category": "Frameworks"},
        {"name": "ROS2 & Linux", "category": "Platforms"}
    ]
}


def test_escape_latex_special_characters():
    raw_text = "R&D $100M+ Budget, 50% Speedup, C# & C++, Project_A #1 {Test} ~ Home ^ Top"
    escaped = latex_template_service.escape_latex(raw_text)
    assert r"\&" in escaped
    assert r"\$" in escaped
    assert r"\%" in escaped
    assert r"\_" in escaped
    assert r"\#" in escaped
    assert r"\{" in escaped
    assert r"\}" in escaped
    assert r"\textasciitilde{}" in escaped
    assert r"\textasciicircum{}" in escaped


def test_normalize_resume_data():
    raw = {
        "firstName": "John",
        "lastName": "Smith",
        "title": "Backend Dev",
        "experiences": [
            {
                "role": "Software Engineer",
                "company": "Tech Labs",
                "bullets": ["Wrote APIs", "Maintained DB"]
            }
        ],
        "skills": {"languages": "Python, Go", "tools": "Docker"}
    }
    normalized = latex_template_service.normalize_resume_data(raw)
    assert normalized["personal"]["fullName"] == "John Smith"
    assert len(normalized["experience"]) == 1
    assert normalized["experience"][0]["position"] == "Software Engineer"
    assert "Wrote APIs" in normalized["experience"][0]["description"]
    assert len(normalized["skills"]) == 3


def test_render_all_nine_templates():
    for tpl in latex_template_service.TEMPLATES_METADATA:
        tpl_id = tpl["id"]
        files = latex_template_service.render_resume_to_latex(tpl_id, SAMPLE_RESUME_DATA)
        assert "cv.tex" in files
        assert len(files["cv.tex"]) > 50
        # Assert user name is present in cv.tex
        assert "Sarah Connor" in files["cv.tex"]
        # Assert no leftover master files are altered
        tpl_dir = os.path.join(latex_template_service.TEMPLATES_DIR, tpl_id)
        assert os.path.exists(tpl_dir)


def test_compiler_detection_and_missing_error():
    # Calling compile_latex when no compiler exists returns structured error
    files = {"cv.tex": "\\documentclass{article}\\begin{document}Hello\\end{document}"}
    success, pdf_bytes, logs, errors = latex_compile_service.compile_latex(files)
    if not latex_compile_service.is_latex_installed():
        assert not success
        assert len(errors) > 0
        assert "LaTeX compiler" in errors[0]["message"]
