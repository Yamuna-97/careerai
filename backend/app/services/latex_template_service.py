"""
LaTeX Template Service — Adapters for official templates 1 through 9.
Safely extracts and maps normalized resume data to master LaTeX files.
"""

import os
import re
from typing import Dict, Any, List

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")

TEMPLATES_METADATA = [
    {
        "id": "1",
        "name": "AltaCV Template",
        "category": "Creative",
        "description": "Elegant two-column layout with sidebar icons, skill rating bars, and modern typography.",
        "tags": ["Creative", "ATS Friendly"],
        "recommended": True,
        "engine": "xelatex"
    },
    {
        "id": "2",
        "name": "CurVe Academic CV",
        "category": "Academic",
        "description": "Comprehensive modular academic CV layout with separate rubric sections.",
        "tags": ["Academic", "Standard"],
        "recommended": False,
        "engine": "pdflatex"
    },
    {
        "id": "3",
        "name": "MBZUAI Clean Resume",
        "category": "Modern",
        "description": "Single-column clean research and developer layout with accented blue headings.",
        "tags": ["Modern", "ATS Friendly"],
        "recommended": True,
        "engine": "pdflatex"
    },
    {
        "id": "4",
        "name": "Harshibar Developer",
        "category": "Tech",
        "description": "High-impact single-column developer format optimized for tech companies and automated ATS screening.",
        "tags": ["Tech", "ATS Friendly"],
        "recommended": True,
        "engine": "pdflatex"
    },
    {
        "id": "5",
        "name": "SixtySeconds CV",
        "category": "Modern",
        "description": "Multi-column modern sidebar CV with compact structure and icon badges.",
        "tags": ["Modern", "Creative"],
        "recommended": False,
        "engine": "xelatex"
    },
    {
        "id": "6",
        "name": "IIIT Vadodara Placement",
        "category": "Standard",
        "description": "Classic academic and placement format with structured horizontal section rules.",
        "tags": ["Standard", "ATS Friendly"],
        "recommended": False,
        "engine": "pdflatex"
    },
    {
        "id": "7",
        "name": "Intern Fair Corporate",
        "category": "Compact",
        "description": "Structured corporate template designed for internship drives and executive applications.",
        "tags": ["Compact", "Corporate"],
        "recommended": False,
        "engine": "pdflatex"
    },
    {
        "id": "8",
        "name": "Olico Timeline Resume",
        "category": "Tech",
        "description": "Clean timeline-based resume layout highlighting progression and project milestones.",
        "tags": ["Tech", "Timeline"],
        "recommended": False,
        "engine": "pdflatex"
    },
    {
        "id": "9",
        "name": "TCCV Compact Two-Column",
        "category": "Compact",
        "description": "Space-efficient two-column layout with bold vertical section alignment.",
        "tags": ["Compact", "Clean"],
        "recommended": True,
        "engine": "pdflatex"
    }
]


def escape_latex(val: Any) -> str:
    """Safely escapes LaTeX special characters."""
    if val is None:
        return ""
    s = str(val)
    if not s:
        return ""

    replacements = [
        ('\\', r'\textbackslash{}'),
        ('&', r'\&'),
        ('%', r'\%'),
        ('$', r'\$'),
        ('#', r'\#'),
        ('_', r'\_'),
        ('{', r'\{'),
        ('}', r'\}'),
        ('~', r'\textasciitilde{}'),
        ('^', r'\textasciicircum{}'),
    ]

    for orig, repl in replacements:
        if orig in s:
            s = s.replace(orig, repl)
    return s


def normalize_resume_data(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Normalizes resume data from various frontend formats into a single canonical structure."""
    if not isinstance(raw, dict):
        raw = {}

    personal = raw.get("personal", {})
    if not isinstance(personal, dict):
        personal = {}

    full_name = raw.get("fullName") or raw.get("full_name") or personal.get("fullName")
    if not full_name and (raw.get("firstName") or raw.get("lastName")):
        full_name = f"{raw.get('firstName', '')} {raw.get('lastName', '')}".strip()
    if not full_name and (personal.get("firstName") or personal.get("lastName")):
        full_name = f"{personal.get('firstName', '')} {personal.get('lastName', '')}".strip()

    title = raw.get("title") or personal.get("title") or ""
    email = raw.get("email") or personal.get("email") or ""
    phone = raw.get("phone") or personal.get("phone") or ""
    location = raw.get("location") or personal.get("location") or ""
    linkedin = raw.get("linkedin") or personal.get("linkedin") or ""
    github = raw.get("github") or personal.get("github") or ""
    portfolio = raw.get("portfolio") or personal.get("portfolio") or ""
    summary = raw.get("summary") or personal.get("summary") or ""

    # Normalize Education
    raw_edu = raw.get("education", [])
    if isinstance(raw_edu, dict):
        raw_edu = [raw_edu]
    edu_list = []
    for item in raw_edu:
        if not isinstance(item, dict):
            continue
        edu_list.append({
            "institution": item.get("institution") or item.get("school") or "",
            "degree": item.get("degree") or "",
            "fieldOfStudy": item.get("fieldOfStudy") or item.get("field") or "",
            "startDate": item.get("startDate") or item.get("period", "").split(" - ")[0] or "",
            "endDate": item.get("endDate") or (item.get("period", "").split(" - ")[1] if " - " in item.get("period", "") else ""),
            "grade": item.get("grade") or "",
            "description": item.get("description") or ""
        })

    # Normalize Experience
    raw_exp = raw.get("experience", raw.get("experiences", []))
    if isinstance(raw_exp, dict):
        raw_exp = [raw_exp]
    exp_list = []
    for item in raw_exp:
        if not isinstance(item, dict):
            continue
        bullets = item.get("bullets", [])
        desc = item.get("description", "")
        if not desc and bullets:
            desc = "\n".join(f"• {b}" for b in bullets if b)
        exp_list.append({
            "company": item.get("company") or "",
            "position": item.get("position") or item.get("role") or "",
            "location": item.get("location") or "",
            "startDate": item.get("startDate") or item.get("period", "").split(" - ")[0] or "",
            "endDate": item.get("endDate") or (item.get("period", "").split(" - ")[1] if " - " in item.get("period", "") else ""),
            "currentlyWorking": bool(item.get("currentlyWorking", False)),
            "description": desc
        })

    # Normalize Projects
    raw_proj = raw.get("projects", [])
    if isinstance(raw_proj, dict):
        raw_proj = [raw_proj]
    proj_list = []
    for item in raw_proj:
        if not isinstance(item, dict):
            continue
        proj_list.append({
            "name": item.get("name") or item.get("title") or "",
            "description": item.get("description") or "",
            "technologies": item.get("technologies") or item.get("tech") or "",
            "githubUrl": item.get("githubUrl") or "",
            "liveUrl": item.get("liveUrl") or ""
        })

    # Normalize Skills
    raw_skills = raw.get("skills", [])
    skills_list = []
    if isinstance(raw_skills, list):
        for s in raw_skills:
            if isinstance(s, dict):
                skills_list.append({
                    "name": s.get("name", ""),
                    "category": s.get("category", "Technical Skills"),
                    "level": s.get("level", "Intermediate")
                })
            elif isinstance(s, str) and s.strip():
                skills_list.append({
                    "name": s.strip(),
                    "category": "Technical Skills",
                    "level": "Intermediate"
                })
    elif isinstance(raw_skills, dict):
        for cat, items in raw_skills.items():
            if isinstance(items, str):
                items = [x.strip() for x in items.split(",") if x.strip()]
            for item in items:
                skills_list.append({
                    "name": str(item),
                    "category": cat.replace("_", " ").title(),
                    "level": "Intermediate"
                })

    return {
        "personal": {
            "fullName": full_name or "",
            "title": title,
            "email": email,
            "phone": phone,
            "location": location,
            "linkedin": linkedin,
            "github": github,
            "portfolio": portfolio
        },
        "summary": summary,
        "education": edu_list,
        "experience": exp_list,
        "projects": proj_list,
        "skills": skills_list,
        "certifications": raw.get("certifications", []),
        "achievements": raw.get("achievements", []),
        "languages": raw.get("languages", [])
    }


def read_master_template_files(template_id: str) -> Dict[str, str]:
    """Reads master template files without modifying the disk repository."""
    tpl_dir = os.path.join(TEMPLATES_DIR, str(template_id))
    if not os.path.isdir(tpl_dir):
        raise ValueError(f"Template directory '{template_id}' not found.")

    files: Dict[str, str] = {}
    for root, _, filenames in os.walk(tpl_dir):
        for fn in filenames:
            ext = os.path.splitext(fn)[1].lower()
            if ext in [".tex", ".cls", ".sty", ".bib"]:
                full_path = os.path.join(root, fn)
                rel_path = os.path.relpath(full_path, tpl_dir).replace("\\", "/")
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        files[rel_path] = f.read()
                except Exception as e:
                    print(f"Warning reading template file {full_path}: {e}")
    return files


# ── Adapters for Templates ────────────────────────────────────────────────────

def render_template_1(data: Dict[str, Any], files: Dict[str, str]) -> Dict[str, str]:
    """AltaCV Adapter: Two-column layout with sidebar."""
    p = data["personal"]
    name = escape_latex(p.get("fullName") or "Your Name")
    tagline = escape_latex(p.get("title") or "")
    email = escape_latex(p.get("email") or "")
    phone = escape_latex(p.get("phone") or "")
    location = escape_latex(p.get("location") or "")
    linkedin = escape_latex(p.get("linkedin") or "")
    github = escape_latex(p.get("github") or "")
    summary = escape_latex(data.get("summary") or "")

    exp_tex = ""
    for exp in data.get("experience", []):
        pos = escape_latex(exp.get("position") or "")
        comp = escape_latex(exp.get("company") or "")
        loc = escape_latex(exp.get("location") or "")
        dates = f"{escape_latex(exp.get('startDate') or '')} -- {escape_latex(exp.get('endDate') or ('Present' if exp.get('currentlyWorking') else ''))}"
        desc = escape_latex(exp.get("description") or "")
        
        bullets_tex = ""
        if desc:
            for line in desc.split("\n"):
                line_clean = line.strip().lstrip("•-*").strip()
                if line_clean:
                    bullets_tex += f"\\item {line_clean}\n"

        item_content = bullets_tex if bullets_tex else f"\\item {desc}"
        exp_tex += (
            f"\\cvevent{{{pos}}}{{{comp}}}{{{dates}}}{{{loc}}}\n"
            f"\\begin{{itemize}}\n"
            f"{item_content}\n"
            f"\\end{{itemize}}\n"
            f"\\medskip\n"
        )

    proj_tex = ""
    for proj in data.get("projects", []):
        pname = escape_latex(proj.get("name") or "")
        ptech = escape_latex(proj.get("technologies") or "")
        pdesc = escape_latex(proj.get("description") or "")
        proj_tex += (
            f"\\cvevent{{{pname}}}{{{ptech}}}{{}}{{}}\n"
            f"\\begin{{itemize}}\n"
            f"\\item {pdesc}\n"
            f"\\end{{itemize}}\n"
            f"\\medskip\n"
        )

    edu_tex = ""
    for edu in data.get("education", []):
        deg = escape_latex(f"{edu.get('degree', '')} {edu.get('fieldOfStudy', '')}".strip())
        inst = escape_latex(edu.get("institution") or "")
        dates = f"{escape_latex(edu.get('startDate') or '')} -- {escape_latex(edu.get('endDate') or '')}"
        edu_tex += (
            f"\\cvevent{{{deg}}}{{{inst}}}{{{dates}}}{{}}\n"
            f"\\medskip\n"
        )

    skills_tex = ""
    for s in data.get("skills", []):
        sname = escape_latex(s.get("name") or "")
        if sname:
            skills_tex += f"\\cvtag{{{sname}}}\n"

    email_line = f"  \\email{{{email}}}\n" if email else ""
    phone_line = f"  \\phone{{{phone}}}\n" if phone else ""
    location_line = f"  \\location{{{location}}}\n" if location else ""
    linkedin_line = f"  \\linkedin{{{linkedin}}}\n" if linkedin else ""
    github_line = f"  \\github{{{github}}}\n" if github else ""

    summary_section = f"\\cvsection{{Summary}}\n{summary}\n\\medskip\n" if summary else ""
    exp_section = f"\\cvsection{{Experience}}\n{exp_tex}\n" if exp_tex else ""
    proj_section = f"\\cvsection{{Projects}}\n{proj_tex}\n" if proj_tex else ""
    skills_section = f"\\cvsection{{Skills}}\n{skills_tex}\n\\medskip\n" if skills_tex else ""
    edu_section = f"\\cvsection{{Education}}\n{edu_tex}\n\\medskip\n" if edu_tex else ""

    cv_source = f"""\\documentclass[10pt,a4paper,withhyper]{{altacv}}
\\geometry{{left=1.25cm,right=1.25cm,top=1.5cm,bottom=1.5cm,columnsep=1.2cm}}
\\usepackage{{paracol}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage[rm]{{roboto}}
\\usepackage[defaultsans]{{lato}}
\\renewcommand{{\\familydefault}}{{\\sfdefault}}

\\definecolor{{SlateGrey}}{{HTML}}{{2E2E2E}}
\\definecolor{{LightGrey}}{{HTML}}{{666666}}
\\definecolor{{DarkPastelRed}}{{HTML}}{{450808}}
\\definecolor{{PastelRed}}{{HTML}}{{8F0D0D}}
\\definecolor{{GoldenEarth}}{{HTML}}{{E7D192}}
\\colorlet{{name}}{{black}}
\\colorlet{{tagline}}{{PastelRed}}
\\colorlet{{heading}}{{DarkPastelRed}}
\\colorlet{{headingrule}}{{GoldenEarth}}
\\colorlet{{subheading}}{{PastelRed}}
\\colorlet{{accent}}{{PastelRed}}
\\colorlet{{emphasis}}{{SlateGrey}}
\\colorlet{{body}}{{LightGrey}}

\\begin{{document}}
\\name{{{name}}}
\\tagline{{{tagline}}}

\\personalinfo{{%
{email_line}{phone_line}{location_line}{linkedin_line}{github_line}}}

\\makecvheader

\\columnratio{{0.6}}
\\begin{{paracol}}{{2}}

{summary_section}
{exp_section}
{proj_section}

\\switchcolumn

{skills_section}
{edu_section}

\\end{{paracol}}
\\end{{document}}
"""
    files["cv.tex"] = cv_source
    if "sample.tex" in files:
        del files["sample.tex"]
    return files


def render_template_2(data: Dict[str, Any], files: Dict[str, str]) -> Dict[str, str]:
    """CurVe Academic Resume Adapter."""
    p = data["personal"]
    name = escape_latex(p.get("fullName") or "Your Name")
    title = escape_latex(p.get("title") or "")
    email = escape_latex(p.get("email") or "")
    phone = escape_latex(p.get("phone") or "")
    location = escape_latex(p.get("location") or "")
    linkedin = escape_latex(p.get("linkedin") or "")
    github = escape_latex(p.get("github") or "")
    portfolio = escape_latex(p.get("portfolio") or "")
    summary = escape_latex(data.get("summary") or "")

    email_line = f"  \\makefield{{\\faEnvelope[regular]}}{{\\href{{mailto:{email}}}{{\\texttt{{{email}}}}}}}" if email else ""
    phone_line = f"  \\makefield{{\\faPhone}}{{\\texttt{{{phone}}}}}" if phone else ""
    linkedin_line = f"  \\makefield{{\\faLinkedin}}{{\\href{{https://linkedin.com/in/{linkedin}}}{{\\texttt{{{linkedin}}}}}}}" if linkedin else ""
    github_line = f"  \\makefield{{\\faGithub}}{{\\href{{https://github.com/{github}}}{{\\texttt{{{github}}}}}}}" if github else ""
    portfolio_line = f"  \\makefield{{\\faGlobe}}{{\\href{{{portfolio}}}{{\\texttt{{{portfolio}}}}}}}" if portfolio else ""

    fields = [email_line, phone_line, linkedin_line, github_line, portfolio_line]
    fields_tex = "\n".join([f for f in fields if f])
    summary_section = f"\\cvtext{{{summary}}}" if summary else ""

    cv_source = f"""\\documentclass[a4paper,skipsamekey,11pt,english]{{curve}}
\\usepackage{{settings}}

\\leftheader{{%
  {{\\LARGE\\bfseries\\sffamily {name}}} \\\\[4pt]
  {{\\large\\sffamily {title}}} \\\\[4pt]
{fields_tex}
}}

\\rightheader{{~}}
\\title{{Curriculum Vitae}}

\\begin{{document}}
\\makeheaders[c]

{summary_section}

\\makerubric{{employment}}
\\makerubric{{education}}
\\makerubric{{skills}}
\\makerubric{{projects}}

\\end{{document}}
"""

    emp_rubric = "\\begin{rubric}{Employment History}\n"
    for exp in data.get("experience", []):
        pos = escape_latex(exp.get("position") or "")
        comp = escape_latex(exp.get("company") or "")
        loc = escape_latex(exp.get("location") or "")
        dates = f"{escape_latex(exp.get('startDate') or '')} -- {escape_latex(exp.get('endDate') or ('Present' if exp.get('currentlyWorking') else ''))}"
        desc = escape_latex(exp.get("description") or "").replace("\n", " ")
        emp_rubric += f"\\entry*[{dates}]%\n\t\\textbf{{{pos}}}, {comp} {f'({loc})' if loc else ''}.\n\t\\par {desc}\n"
    emp_rubric += "\\end{rubric}\n"

    edu_rubric = "\\begin{rubric}{Education}\n"
    for edu in data.get("education", []):
        deg = escape_latex(f"{edu.get('degree', '')} {edu.get('fieldOfStudy', '')}".strip())
        inst = escape_latex(edu.get("institution") or "")
        dates = f"{escape_latex(edu.get('startDate') or '')} -- {escape_latex(edu.get('endDate') or '')}"
        grade = escape_latex(edu.get("grade") or "")
        grade_line = f"\\par Grade: {grade}" if grade else ""
        edu_rubric += f"\\entry*[{dates}]%\n\t\\textbf{{{deg}}}, {inst}.\n\t{grade_line}\n"
    edu_rubric += "\\end{rubric}\n"

    skills_rubric = "\\begin{rubric}{Skills}\n"
    skills_by_cat = {}
    for s in data.get("skills", []):
        cat = s.get("category") or "Technical Skills"
        sname = escape_latex(s.get("name") or "")
        if sname:
            skills_by_cat.setdefault(cat, []).append(sname)
    for cat, items in skills_by_cat.items():
        skills_rubric += f"\\entry*[{escape_latex(cat)}]\n\t{', '.join(items)}\n"
    skills_rubric += "\\end{rubric}\n"

    proj_rubric = "\\begin{rubric}{Key Projects}\n"
    for proj in data.get("projects", []):
        pname = escape_latex(proj.get("name") or "")
        ptech = escape_latex(proj.get("technologies") or "")
        pdesc = escape_latex(proj.get("description") or "")
        proj_rubric += f"\\entry*[{ptech}]%\n\t\\textbf{{{pname}}}.\n\t\\par {pdesc}\n"
    proj_rubric += "\\end{rubric}\n"

    files["cv.tex"] = cv_source
    files["employment.tex"] = emp_rubric
    files["education.tex"] = edu_rubric
    files["skills.tex"] = skills_rubric
    files["projects.tex"] = proj_rubric
    
    if "cv-llt.tex" in files:
        del files["cv-llt.tex"]
    return files


def render_template_3(data: Dict[str, Any], files: Dict[str, str]) -> Dict[str, str]:
    """MBZUAI Resume Adapter: Clean single-column research layout."""
    p = data["personal"]
    name = escape_latex(p.get("fullName") or "Your Name")
    title = escape_latex(p.get("title") or "")
    email = escape_latex(p.get("email") or "")
    phone = escape_latex(p.get("phone") or "")
    location = escape_latex(p.get("location") or "")
    linkedin = escape_latex(p.get("linkedin") or "")
    github = escape_latex(p.get("github") or "")
    summary = escape_latex(data.get("summary") or "")

    edu_tex = ""
    for edu in data.get("education", []):
        deg = escape_latex(f"{edu.get('degree', '')} in {edu.get('fieldOfStudy', '')}".strip())
        inst = escape_latex(edu.get("institution") or "")
        dates = f"{escape_latex(edu.get('startDate') or '')} -- {escape_latex(edu.get('endDate') or '')}"
        grade = escape_latex(edu.get("grade") or "")
        grade_line = f"\\textbf{{GPA / Grade:}} {grade} \\\\\n" if grade else ""
        edu_tex += (
            f"\\blueitem{{{dates}: {deg}}} \\\\\n"
            f"\\textit{{{inst}}} \\\\\n"
            f"{grade_line}"
            f"\\vspace{{0.3em}}\n"
        )

    exp_tex = ""
    for exp in data.get("experience", []):
        pos = escape_latex(exp.get("position") or "")
        comp = escape_latex(exp.get("company") or "")
        loc = escape_latex(exp.get("location") or "")
        dates = f"{escape_latex(exp.get('startDate') or '')} -- {escape_latex(exp.get('endDate') or ('Present' if exp.get('currentlyWorking') else ''))}"
        desc = escape_latex(exp.get("description") or "")
        
        bullets_tex = ""
        if desc:
            for line in desc.split("\n"):
                line_clean = line.strip().lstrip("•-*").strip()
                if line_clean:
                    bullets_tex += f"    \\item {line_clean}\n"

        comp_loc = f"{comp}, {loc}" if loc else comp
        item_content = bullets_tex if bullets_tex else f"    \\item {desc}\n"
        exp_tex += (
            f"\\blueitem{{{dates}: {pos}}} \\\\\n"
            f"\\textit{{{comp_loc}}}\n"
            f"\\begin{{itemize}}\n"
            f"{item_content}"
            f"\\end{{itemize}}\n"
            f"\\vspace{{0.3em}}\n"
        )

    proj_tex = ""
    for proj in data.get("projects", []):
        pname = escape_latex(proj.get("name") or "")
        ptech = escape_latex(proj.get("technologies") or "")
        pdesc = escape_latex(proj.get("description") or "")
        tech_suffix = f" \\textit{{({ptech})}}" if ptech else ""
        proj_tex += (
            f"\\blueitem{{{pname}}}{tech_suffix} \\\\\n"
            f"\\begin{{itemize}}\n"
            f"    \\item {pdesc}\n"
            f"\\end{{itemize}}\n"
            f"\\vspace{{0.3em}}\n"
        )

    skills_list = [escape_latex(s.get("name") or "") for s in data.get("skills", []) if s.get("name")]
    skills_str = ", ".join(skills_list)
    contact_line = " | ".join([x for x in [email, phone, location, linkedin, github] if x])

    title_line = f"\\textbf{{{title}}} \\\\\n" if title else ""
    summary_section = f"\\section*{{Personal Profile}}\n{summary}\n" if summary else ""
    edu_section = f"\\section*{{Education}}\n{edu_tex}\n" if edu_tex else ""
    exp_section = f"\\section*{{Experience}}\n{exp_tex}\n" if exp_tex else ""
    proj_section = f"\\section*{{Key Projects}}\n{proj_tex}\n" if proj_tex else ""
    skills_section = f"\\section*{{Technical Skills}}\n{skills_str}\n" if skills_str else ""

    cv_source = f"""\\documentclass[11pt,a4paper]{{article}}
\\usepackage[left=0.8in,top=0.8in,right=0.8in,bottom=0.8in]{{geometry}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{xcolor}}
\\usepackage{{titlesec}}
\\usepackage{{enumitem}}
\\usepackage{{parskip}}
\\usepackage[hidelinks]{{hyperref}}

\\definecolor{{titleblue}}{{HTML}}{{00199e}}
\\definecolor{{subtitleblue}}{{HTML}}{{2ec1e0}}
\\definecolor{{darktext}}{{HTML}}{{222222}}

\\color{{darktext}}
\\linespread{{0.95}}

\\titleformat{{\\section}}{{\\Large\\bfseries\\color{{titleblue}}}}{{}}{{0em}}{{}}
\\titlespacing*{{\\section}}{{0pt}}{{0.8em}}{{0.2em}}

\\newcommand{{\\blueitem}}[1]{{\\textcolor{{subtitleblue}}{{\\textbf{{#1}}}}}}
\\setlist[itemize]{{label=\\textbullet, leftmargin=*, noitemsep, topsep=0pt, parsep=0pt}}

\\begin{{document}}

{{\\Huge \\textbf{{\\textcolor{{titleblue}}{{{name}}}}}}} \\vspace{{0.2em}}

{title_line}{contact_line}

\\vspace{{0.4em}}

{summary_section}
{edu_section}
{exp_section}
{proj_section}
{skills_section}

\\end{{document}}
"""
    files["cv.tex"] = cv_source
    if "MBZUAI Resume template.tex" in files:
        del files["MBZUAI Resume template.tex"]
    return files


def render_template_4(data: Dict[str, Any], files: Dict[str, str]) -> Dict[str, str]:
    """Harshibar's Developer Resume Adapter: Single-column developer layout."""
    p = data["personal"]
    name = escape_latex(p.get("fullName") or "Your Name")
    email = escape_latex(p.get("email") or "")
    phone = escape_latex(p.get("phone") or "")
    location = escape_latex(p.get("location") or "")
    linkedin = escape_latex(p.get("linkedin") or "")
    github = escape_latex(p.get("github") or "")
    summary = escape_latex(data.get("summary") or "")

    edu_tex = ""
    for edu in data.get("education", []):
        deg = escape_latex(f"{edu.get('degree', '')} in {edu.get('fieldOfStudy', '')}".strip())
        inst = escape_latex(edu.get("institution") or "")
        dates = f"{escape_latex(edu.get('startDate') or '')} -- {escape_latex(edu.get('endDate') or '')}"
        edu_tex += (
            f"\\resumeSubheading\n"
            f"  {{{inst}}}{{{dates}}}\n"
            f"  {{{deg}}}{{}}\n"
        )

    exp_tex = ""
    for exp in data.get("experience", []):
        pos = escape_latex(exp.get("position") or "")
        comp = escape_latex(exp.get("company") or "")
        loc = escape_latex(exp.get("location") or "")
        dates = f"{escape_latex(exp.get('startDate') or '')} -- {escape_latex(exp.get('endDate') or ('Present' if exp.get('currentlyWorking') else ''))}"
        desc = escape_latex(exp.get("description") or "")

        bullets_tex = ""
        if desc:
            for line in desc.split("\n"):
                line_clean = line.strip().lstrip("•-*").strip()
                if line_clean:
                    bullets_tex += f"    \\resumeItem{{{line_clean}}}\n"

        item_content = bullets_tex if bullets_tex else f"    \\resumeItem{{{desc}}}\n"
        exp_tex += (
            f"\\resumeSubheading\n"
            f"  {{{pos}}}{{{dates}}}\n"
            f"  {{{comp}}}{{{loc}}}\n"
            f"  \\resumeItemListStart\n"
            f"{item_content}"
            f"  \\resumeItemListEnd\n"
        )

    proj_tex = ""
    for proj in data.get("projects", []):
        pname = escape_latex(proj.get("name") or "")
        ptech = escape_latex(proj.get("technologies") or "")
        pdesc = escape_latex(proj.get("description") or "")
        proj_tex += (
            f"\\resumeSubheading\n"
            f"  {{{pname}}}{{{ptech}}}\n"
            f"  {{}}{{}}\n"
            f"  \\resumeItemListStart\n"
            f"    \\resumeItem{{{pdesc}}}\n"
            f"  \\resumeItemListEnd\n"
        )

    skills_by_cat = {}
    for s in data.get("skills", []):
        cat = s.get("category") or "Technical Skills"
        sname = escape_latex(s.get("name") or "")
        if sname:
            skills_by_cat.setdefault(cat, []).append(sname)

    skills_tex = ""
    for cat, items in skills_by_cat.items():
        skills_tex += f"\\textbf{{{escape_latex(cat)}}}: {', '.join(items)} \\\\\n"

    contact_parts = []
    if email: contact_parts.append(email)
    if phone: contact_parts.append(phone)
    if location: contact_parts.append(location)
    if linkedin: contact_parts.append(linkedin)
    if github: contact_parts.append(github)
    contact_str = " $\\mid$ ".join(contact_parts)

    summary_section = f"\\section{{Summary}}\n\\small {summary}\n" if summary else ""
    exp_section = f"\\section{{Experience}}\n\\begin{{itemize}}[leftmargin=0in, label={{}}]\n{exp_tex}\\end{{itemize}}\n" if exp_tex else ""
    proj_section = f"\\section{{Projects}}\n\\begin{{itemize}}[leftmargin=0in, label={{}}]\n{proj_tex}\\end{{itemize}}\n" if proj_tex else ""
    edu_section = f"\\section{{Education}}\n\\begin{{itemize}}[leftmargin=0in, label={{}}]\n{edu_tex}\\end{{itemize}}\n" if edu_tex else ""
    skills_section = f"\\section{{Technical Skills}}\n\\small{{\n{skills_tex}}}\n" if skills_tex else ""

    cv_source = f"""\\documentclass[letterpaper,11pt]{{article}}
\\usepackage[empty]{{fullpage}}
\\usepackage{{titlesec}}
\\usepackage[usenames,dvipsnames]{{color}}
\\usepackage{{enumitem}}
\\usepackage[hidelinks]{{hyperref}}
\\usepackage{{fancyhdr}}
\\usepackage[english]{{babel}}
\\usepackage{{tabularx}}
\\usepackage[T1]{{fontenc}}
\\usepackage[utf8]{{inputenc}}

\\pagestyle{{fancy}}
\\fancyhf{{}}
\\renewcommand{{\\headrulewidth}}{{0pt}}
\\renewcommand{{\\footrulewidth}}{{0pt}}

\\addtolength{{\\oddsidemargin}}{{-0.5in}}
\\addtolength{{\\evensidemargin}}{{0in}}
\\addtolength{{\\textwidth}}{{1in}}
\\addtolength{{\\topmargin}}{{-.5in}}
\\addtolength{{\\textheight}}{{1.0in}}

\\urlstyle{{same}}
\\raggedbottom
\\raggedright
\\setlength{{\\tabcolsep}}{{0in}}

\\definecolor{{light-grey}}{{gray}}{{0.83}}
\\titleformat{{\\section}}{{\\bfseries \\vspace{{2pt}} \\raggedright \\large}}{{}}{{0em}}{{}}[\\color{{light-grey}} {{\\titlerule[2pt]}} \\vspace{{-4pt}}]

\\newcommand{{\\resumeItem}}[1]{{\\item\\small{{#1 \\vspace{{-1pt}}}}}}
\\newcommand{{\\resumeSubheading}}[4]{{
  \\vspace{{-1pt}}\\item
    \\begin{{tabular*}}{{\\textwidth}}[t]{{l@{{\\extracolsep{{\\fill}}}}r}}
      \\textbf{{#1}} & #2 \\\\
      \\textit{{\\small#3}} & \\textit{{\\small #4}} \\\\
    \\end{{tabular*}}\\vspace{{-5pt}}
}}
\\newcommand{{\\resumeItemListStart}}{{\\begin{{itemize}}[leftmargin=0.15in]}}
\\newcommand{{\\resumeItemListEnd}}{{\\end{{itemize}}\\vspace{{-5pt}}}}

\\begin{{document}}

\\begin{{center}}
  {{\\LARGE \\textbf{{{name}}}}} \\\\[3pt]
  \\small {contact_str}
\\end{{center}}

{summary_section}
{exp_section}
{proj_section}
{edu_section}
{skills_section}

\\end{{document}}
"""
    files["cv.tex"] = cv_source
    if "main.tex" in files:
        del files["main.tex"]
    return files


def render_template_5(data: Dict[str, Any], files: Dict[str, str]) -> Dict[str, str]:
    """SixtySecondsCV Adapter."""
    p = data["personal"]
    name = escape_latex(p.get("fullName") or "Your Name")
    title = escape_latex(p.get("title") or "")
    email = escape_latex(p.get("email") or "")
    phone = escape_latex(p.get("phone") or "")
    location = escape_latex(p.get("location") or "")
    linkedin = escape_latex(p.get("linkedin") or "")
    github = escape_latex(p.get("github") or "")
    portfolio = escape_latex(p.get("portfolio") or "")
    summary = escape_latex(data.get("summary") or "")

    exp_tex = "\\begin{cvtable}[3]\n"
    for exp in data.get("experience", []):
        pos = escape_latex(exp.get("position") or "")
        comp = escape_latex(exp.get("company") or "")
        loc = escape_latex(exp.get("location") or "")
        dates = f"{escape_latex(exp.get('startDate') or '')} -- {escape_latex(exp.get('endDate') or ('Present' if exp.get('currentlyWorking') else ''))}"
        desc = escape_latex(exp.get("description") or "").replace("\n", " ")
        exp_tex += f"\t\\cvitem{{{dates}}}{{{pos}}}{{{comp} {f'({loc})' if loc else ''}}}{{{desc}}}\n"
    exp_tex += "\\end{cvtable}\n"

    edu_tex = "\\begin{cvtable}[1.5]\n"
    for edu in data.get("education", []):
        deg = escape_latex(f"{edu.get('degree', '')} {edu.get('fieldOfStudy', '')}".strip())
        inst = escape_latex(edu.get("institution") or "")
        dates = f"{escape_latex(edu.get('startDate') or '')} -- {escape_latex(edu.get('endDate') or '')}"
        grade = escape_latex(edu.get("grade") or "")
        desc = f"Grade: {grade}" if grade else ""
        edu_tex += f"\t\\cvitem{{{dates}}}{{{deg}}}{{{inst}}}{{{desc}}}\n"
    edu_tex += "\\end{cvtable}\n"

    proj_tex = "\\begin{cvtable}[1.5]\n"
    for proj in data.get("projects", []):
        pname = escape_latex(proj.get("name") or "")
        ptech = escape_latex(proj.get("technologies") or "")
        pdesc = escape_latex(proj.get("description") or "")
        proj_tex += f"\t\\cvitem{{}}{{{pname}}}{{{ptech}}}{{{pdesc}}}\n"
    proj_tex += "\\end{cvtable}\n"

    skills_list = [escape_latex(s.get("name") or "") for s in data.get("skills", []) if s.get("name")]
    skills_tex = ""
    for s in skills_list[:6]:
        skills_tex += f"\t\\skill{{\\faChevronRight}}{{{s}}}\n"

    linkedin_social = f"\\social{{\\faLinkedin}}{{https://linkedin.com/in/{linkedin}}}{{LinkedIn}}" if linkedin else ""
    github_social = f"\\social{{\\faGithub}}{{https://github.com/{github}}}{{GitHub}}" if github else ""

    cv_source = f"""\\documentclass[
	a4paper,
	sidecolor=gray!50,
	sectioncolor=materialblue,
	subsectioncolor=materialindigo,
	profilepicsize=3.5cm,
	profilepicstyle=profilecircle,
	profilepiczoom=1.0,
]{{sixtysecondscv}}
\\usepackage{{microtype}}
\\usepackage{{ragged2e}}
\\usepackage{{amssymb}}

\\cvname{{{name}}}
\\cvjobtitle{{{title}}}

\\cvaddress{{{location}}}
\\cvphone{{{phone}}}
\\cvsite{{{portfolio}}}
\\cvmail{{{email}}}

\\addtofrontsidebar{{
	\\profilesection{{Social Network}}
		\\begin{{icontable}}{{2.5em}}{{1em}}
            {linkedin_social}
            {github_social}
		\\end{{icontable}}

	\\profilesection{{Technical Skills}}
{skills_tex}
}}

\\addtobacksidebar{{
	\\profilesection{{About Me}}
	\\aboutme{{{summary}}}
}}

\\begin{{document}}
\\makefrontsidebar

\\cvsection{{Working Experience}}
{exp_tex}

\\cvsection{{Education}}
{edu_tex}

\\cvsection{{Key Projects}}
{proj_tex}

\\end{{document}}
"""
    files["cv.tex"] = cv_source
    if "sixtysecondscv.tex" in files:
        del files["sixtysecondscv.tex"]
    return files


def render_template_6(data: Dict[str, Any], files: Dict[str, str]) -> Dict[str, str]:
    """IIIT Vadodara placement style adapter."""
    p = data["personal"]
    name = escape_latex(p.get("fullName") or "Your Name")
    email = escape_latex(p.get("email") or "")
    phone = escape_latex(p.get("phone") or "")
    location = escape_latex(p.get("location") or "")
    linkedin = escape_latex(p.get("linkedin") or "")
    github = escape_latex(p.get("github") or "")
    summary = escape_latex(data.get("summary") or "")

    exp_tex = ""
    for exp in data.get("experience", []):
        pos = escape_latex(exp.get("position") or "")
        comp = escape_latex(exp.get("company") or "")
        dates = f"{escape_latex(exp.get('startDate') or '')} -- {escape_latex(exp.get('endDate') or ('Present' if exp.get('currentlyWorking') else ''))}"
        desc = escape_latex(exp.get("description") or "")
        exp_tex += (
            f"\\textbf{{{comp}}} \\hfill {dates} \\\\\n"
            f"\\textit{{{pos}}}\n"
            f"\\begin{{itemize}}[noitemsep,topsep=0pt]\n"
            f"\\item {desc}\n"
            f"\\end{{itemize}}\n"
            f"\\vspace{{2mm}}\n"
        )

    edu_tex = ""
    for edu in data.get("education", []):
        deg = escape_latex(f"{edu.get('degree', '')} {edu.get('fieldOfStudy', '')}".strip())
        inst = escape_latex(edu.get("institution") or "")
        dates = f"{escape_latex(edu.get('startDate') or '')} -- {escape_latex(edu.get('endDate') or '')}"
        edu_tex += f"\\textbf{{{inst}}} \\hfill {dates} \\\\\n\\textit{{{deg}}} \\\\[1mm]\n"

    skills_list = [escape_latex(s.get("name") or "") for s in data.get("skills", []) if s.get("name")]
    skills_joined = ", ".join(skills_list)

    email_part = f"Email: {email} $\\mid$ " if email else ""
    phone_part = f"Phone: {phone} $\\mid$ " if phone else ""
    linkedin_part = f"LinkedIn: {linkedin} $\\mid$ " if linkedin else ""
    github_part = f"GitHub: {github}" if github else ""

    summary_section = f"\\section*{{Professional Summary}}\n{summary}\n" if summary else ""
    exp_section = f"\\section*{{Experience}}\n{exp_tex}\n" if exp_tex else ""
    edu_section = f"\\section*{{Education}}\n{edu_tex}\n" if edu_tex else ""
    skills_section = f"\\section*{{Technical Skills}}\n{skills_joined}\n" if skills_joined else ""

    cv_source = f"""\\documentclass[a4paper,11pt]{{article}}
\\usepackage[empty]{{fullpage}}
\\usepackage{{titlesec}}
\\usepackage{{geometry}}
\\usepackage{{enumitem}}
\\usepackage[hidelinks]{{hyperref}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}

\\geometry{{left=1.4cm, top=1.2cm, right=1.2cm, bottom=1.2cm}}
\\titleformat{{\\section}}{{\\scshape\\raggedright\\large}}{{}}{{0em}}{{}}[\\titlerule]

\\begin{{document}}
\\begin{{center}}
  {{\\Huge \\textbf{{{name}}}}} \\\\[4pt]
  {email_part}{phone_part}{location} \\\\
  {linkedin_part}{github_part}
\\end{{center}}

{summary_section}
{exp_section}
{edu_section}
{skills_section}

\\end{{document}}
"""
    files["cv.tex"] = cv_source
    return files


def render_template_7(data: Dict[str, Any], files: Dict[str, str]) -> Dict[str, str]:
    """Intern Fair Corporate / IITG style adapter."""
    p = data["personal"]
    name = escape_latex(p.get("fullName") or "Your Name")
    title = escape_latex(p.get("title") or "B.Tech Student")
    email = escape_latex(p.get("email") or "")
    phone = escape_latex(p.get("phone") or "")
    location = escape_latex(p.get("location") or "")
    linkedin = escape_latex(p.get("linkedin") or "")
    github = escape_latex(p.get("github") or "")
    portfolio = escape_latex(p.get("portfolio") or "")
    summary = escape_latex(data.get("summary") or "")

    edu_rows = ""
    for edu in data.get("education", []):
        deg = escape_latex(f"{edu.get('degree', '')} {edu.get('fieldOfStudy', '')}".strip())
        inst = escape_latex(edu.get("institution") or "")
        dates = f"{escape_latex(edu.get('startDate') or '')} -- {escape_latex(edu.get('endDate') or '')}"
        grade = escape_latex(edu.get("grade") or "")
        edu_rows += f"  \\hline\n  {deg} & {inst} & {grade or 'N/A'} & {dates} \\\\\n"

    exp_tex = ""
    for exp in data.get("experience", []):
        pos = escape_latex(exp.get("position") or "")
        comp = escape_latex(exp.get("company") or "")
        loc = escape_latex(exp.get("location") or "")
        dates = f"{escape_latex(exp.get('startDate') or '')} - {escape_latex(exp.get('endDate') or ('Present' if exp.get('currentlyWorking') else ''))}"
        desc = escape_latex(exp.get("description") or "")
        
        bullets_tex = ""
        if desc:
            for line in desc.split("\n"):
                line_clean = line.strip().lstrip("•-*").strip()
                if line_clean:
                    bullets_tex += f"    \\item {line_clean}\n"

        item_content = bullets_tex if bullets_tex else f"    \\item {desc}\n"
        exp_tex += (
            f"    \\resumeSubheading\n"
            f"      {{{comp}}}{{{loc}}}\n"
            f"      {{{pos}}}{{{dates}}}\n"
            f"      \\resumeItemListStart\n"
            f"{item_content}"
            f"      \\resumeItemListEnd\n"
        )

    proj_tex = ""
    for proj in data.get("projects", []):
        pname = escape_latex(proj.get("name") or "")
        ptech = escape_latex(proj.get("technologies") or "")
        pdesc = escape_latex(proj.get("description") or "")
        proj_tex += (
            f"    \\resumeProject\n"
            f"      {{{pname}}}\n"
            f"      {{{ptech}}}\n"
            f"      {{}}\n"
            f"      {{\\href{{{portfolio or '#'}}}{{Project Link}}}}\n"
            f"      \\resumeItemListStart\n"
            f"        \\item {pdesc}\n"
            f"      \\resumeItemListEnd\n"
        )

    skills_by_cat = {}
    for s in data.get("skills", []):
        cat = s.get("category") or "Technical Skills"
        sname = escape_latex(s.get("name") or "")
        if sname:
            skills_by_cat.setdefault(cat, []).append(sname)
    skills_tex = "\\resumeHeadingSkillStart\n"
    for cat, items in skills_by_cat.items():
        skills_tex += f"  \\resumeSubItem{{{escape_latex(cat)}}}{{{', '.join(items)}}}\n"
    skills_tex += "\\resumeHeadingSkillEnd\n"

    summary_section = f"\\section{{Summary}}\n\\small {summary}\n" if summary else ""
    exp_section = f"\\section{{Experience}}\n\\resumeSubHeadingListStart\n{exp_tex}\\resumeSubHeadingListEnd\n\\vspace{{-3mm}}\n" if exp_tex else ""
    proj_section = f"\\section{{Projects}}\n\\resumeSubHeadingListStart\n{proj_tex}\\resumeSubHeadingListEnd\n\\vspace{{-3mm}}\n" if proj_tex else ""
    skills_section = f"\\section{{Technical Skills}}\n{skills_tex}\n" if skills_tex else ""

    cv_source = f"""\\documentclass[a4paper,11pt]{{article}}
\\usepackage{{latexsym}}
\\usepackage{{xcolor}}
\\usepackage{{float}}
\\usepackage{{ragged2e}}
\\usepackage[empty]{{fullpage}}
\\usepackage{{wrapfig}}
\\usepackage{{tabularx}}
\\usepackage{{titlesec}}
\\usepackage{{geometry}}
\\usepackage{{marvosym}}
\\usepackage{{verbatim}}
\\usepackage{{enumitem}}
\\usepackage[hidelinks]{{hyperref}}
\\usepackage{{fancyhdr}}
\\usepackage{{graphicx}}
\\usepackage[T1]{{fontenc}}

\\pagestyle{{fancy}}
\\fancyhf{{}}
\\renewcommand{{\\headrulewidth}}{{0pt}}
\\renewcommand{{\\footrulewidth}}{{0pt}}
\\geometry{{left=1.4cm, top=0.8cm, right=1.2cm, bottom=1cm}}

\\usepackage[most]{{tcolorbox}}
\\tcbset{{
	frame code={{}}
	center title,
	left=0pt,
	right=0pt,
	top=0pt,
	bottom=0pt,
	colback=gray!20,
	colframe=white,
	width=\\dimexpr\\textwidth\\relax,
	enlarge left by=-2mm,
	boxsep=4pt,
	arc=0pt,outer arc=0pt,
}}

\\urlstyle{{same}}
\\raggedright
\\setlength{{\\tabcolsep}}{{0in}}

\\titleformat{{\\section}}{{
  \\vspace{{-4pt}}\\scshape\\raggedright\\large
}}{{}}{{0em}}{{}}[\\color{{black}}\\titlerule \\vspace{{-7pt}}]

\\newcommand{{\\resumeItem}}[2]{{
  \\item{{
    \\textbf{{#1}}{{:\\hspace{{0.5mm}}#2 \\vspace{{-0.5mm}}}}
  }}
}}

\\newcommand{{\\resumeSubheading}}[4]{{
\\vspace{{0.5mm}}\\item
    \\begin{{tabular*}}{{0.98\\textwidth}}[t]{{l@{{\\extracolsep{{\\fill}}}}r}}
        \\textbf{{#1}} & \\textit{{\\footnotesize{{#4}}}} \\\\
        \\textit{{\\footnotesize{{#3}}}} &  \\footnotesize{{#2}}\\\\
    \\end{{tabular*}}
    \\vspace{{-2.4mm}}
}}

\\newcommand{{\\resumeProject}}[5]{{
\\vspace{{0.5mm}}\\item
    \\begin{{tabular*}}{{0.98\\textwidth}}[t]{{l@{{\\extracolsep{{\\fill}}}}r}}
        \\textbf{{#1}} & \\textit{{\\footnotesize{{#3}}}} \\\\
        \\footnotesize{{\\textit{{#2}}}} & \\footnotesize{{#4}}
    \\end{{tabular*}}
    \\vspace{{-2.4mm}}
}}

\\renewcommand{{\\labelitemi}}{{$\\vcenter{{\\hbox{{\\tiny$\\bullet$}}}}$}}
\\newcommand{{\\resumeSubHeadingListStart}}{{\\begin{{itemize}}[leftmargin=*,labelsep=0mm]}}
\\newcommand{{\\resumeHeadingSkillStart}}{{\\begin{{itemize}}[leftmargin=*,itemsep=1.7mm, rightmargin=2ex]}}
\\newcommand{{\\resumeItemListStart}}{{\\begin{{justify}}\\begin{{itemize}}[leftmargin=3ex, rightmargin=2ex, noitemsep,labelsep=1.2mm,itemsep=0mm]\\small}}

\\newcommand{{\\resumeSubHeadingListEnd}}{{\\end{{itemize}}\\vspace{{2mm}}}}
\\newcommand{{\\resumeHeadingSkillEnd}}{{\\end{{itemize}}\\vspace{{-2mm}}}}
\\newcommand{{\\resumeItemListEnd}}{{\\end{{itemize}}\\end{{justify}}\\vspace{{-2mm}}}}
\\newcommand{{\\cvsection}}[1]{{%
\\vspace{{2mm}}
\\begin{{tcolorbox}}
    \\textbf{{\\large #1}}
\\end{{tcolorbox}}
    \\vspace{{-4mm}}
}}

\\newcolumntype{{L}}{{>{{\\raggedright\\arraybackslash}}X}}%
\\newcolumntype{{R}}{{>{{\\raggedleft\\arraybackslash}}X}}%
\\newcolumntype{{C}}{{>{{\\centering\\arraybackslash}}X}}%

\\begin{{document}}
\\fontfamily{{cmr}}\\selectfont

\\begin{{tabularx}}{{\\linewidth}}{{L r}}
  \\textbf{{\\LARGE {name}}} & {phone}\\\\
  {{Title: {title}}} & \\href{{mailto:{email}}}{{{email}}} \\\\
  {{Location: {location}}} & \\href{{{portfolio}}}{{{portfolio}}} \\\\
  {{GitHub: github.com/{github}}} & \\href{{https://linkedin.com/in/{linkedin}}}{{linkedin.com/in/{linkedin}}}
\\end{{tabularx}}

\\vspace{{4mm}}

{summary_section}

\\section{{Education}}
\\setlength{{\\tabcolsep}}{{5pt}}
\\small{{\\begin{{tabularx}}{{\\dimexpr\\textwidth-3mm\\relax}}{{|c|C|c|c|}}
  \\hline
  \\textbf{{Degree/Certificate}} & \\textbf{{Institute/Board}} & \\textbf{{CGPA/Percentage}} & \\textbf{{Year}}\\\\
{edu_rows}  \\hline
\\end{{tabularx}}}}
\\vspace{{-2mm}}

{exp_section}
{proj_section}
{skills_section}

\\end{{document}}
"""
    files["cv.tex"] = cv_source
    if "main.tex" in files:
        del files["main.tex"]
    return files


def render_template_8(data: Dict[str, Any], files: Dict[str, str]) -> Dict[str, str]:
    """Olico Timeline Resume adapter."""
    p = data["personal"]
    name = escape_latex(p.get("fullName") or "Your Name")
    title = escape_latex(p.get("title") or "")
    email = escape_latex(p.get("email") or "")
    phone = escape_latex(p.get("phone") or "")
    location = escape_latex(p.get("location") or "")
    linkedin = escape_latex(p.get("linkedin") or "")
    github = escape_latex(p.get("github") or "")
    portfolio = escape_latex(p.get("portfolio") or "")
    summary = escape_latex(data.get("summary") or "")

    exp_tex = ""
    for exp in data.get("experience", []):
        pos = escape_latex(exp.get("position") or "")
        comp = escape_latex(exp.get("company") or "")
        loc = escape_latex(exp.get("location") or "")
        dates = f"{escape_latex(exp.get('startDate') or '')} - {escape_latex(exp.get('endDate') or ('Present' if exp.get('currentlyWorking') else ''))}"
        desc = escape_latex(exp.get("description") or "")
        exp_tex += f"\\cvevent{{{dates}}}{{{pos}}}{{{comp} {f'({loc})' if loc else ''}}}{{{desc}}}{{}}{{}}{{}}\n\n"

    edu_tex = ""
    for edu in data.get("education", []):
        deg = escape_latex(f"{edu.get('degree', '')} {edu.get('fieldOfStudy', '')}".strip())
        inst = escape_latex(edu.get("institution") or "")
        dates = f"{escape_latex(edu.get('startDate') or '')} - {escape_latex(edu.get('endDate') or '')}"
        grade = escape_latex(edu.get("grade") or "")
        edu_tex += f"\\cvevent{{{dates}}}{{{deg}}}{{{inst}}}{{{f'GPA/Grade: {grade}' if grade else ''}}}{{}}{{}}{{}}\n\n"

    proj_tex = ""
    for proj in data.get("projects", []):
        pname = escape_latex(proj.get("name") or "")
        ptech = escape_latex(proj.get("technologies") or "")
        pdesc = escape_latex(proj.get("description") or "")
        proj_tex += f"\\cvevent{{}}{{{pname}}}{{{ptech}}}{{{pdesc}}}{{}}{{}}{{}}\n\n"

    skills_list = [escape_latex(s.get("name") or "") for s in data.get("skills", []) if s.get("name")]
    skills_tex = ""
    for s in skills_list[:8]:
        skills_tex += f"\\cvskill{{{s}}} {{}} {{0.8}} \\\\[-2pt]\n"

    exp_section = f"\\cvsection{{Experience}}\n{exp_tex}\n" if exp_tex else ""
    edu_section = f"\\cvsection{{Education}}\n{edu_tex}\n" if edu_tex else ""
    proj_section = f"\\cvsection{{Projects}}\n{proj_tex}\n" if proj_tex else ""

    cv_source = f"""\\documentclass[10pt]{{article}}
\\usepackage{{eurosym}}
\\usepackage{{fancyhdr}}
\\usepackage{{lastpage}}
\\usepackage[utf8]{{inputenc}}
\\usepackage{{xstring, xifthen}}
\\usepackage[default]{{gillius}}
\\renewcommand*\\familydefault{{\\sfdefault}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{moresize}}
\\usepackage{{fontawesome5}}
\\usepackage{{tikz}}
\\usepackage{{paracol}}
\\usepackage[hidelinks]{{hyperref}}

\\newcommand{{\\mpwidth}}{{\\linewidth-\\fboxsep-\\fboxsep}}

\\newcommand{{\\cvtext}}[1] {{
 \\begin{{tabular*}}{{1\\mpwidth}}{{p{{0.98\\mpwidth}}}}
  \\parbox{{1\\mpwidth}}{{#1}}
 \\end{{tabular*}}
}}

\\newcommand{{\\cvsection}}[1] {{
 \\vspace{{14pt}}
 \\cvtext{{
  \\textbf{{\\LARGE{{\\textcolor{{darkcol}}{{\\uppercase{{#1}}}}}}}}\\\\[-4pt]
  \\textcolor{{maincol}}{{ \\rule{{0.15\\textwidth}}{{2pt}}}}  \\\\
 }}
}}

\\newcommand{{\\cvskill}}[3] {{
 \\begin{{tabular*}}{{1\\mpwidth}}{{p{{0.53\\mpwidth}}  r}}
   \\textcolor{{black}}{{\\textbf{{#1}}}} & \\textcolor{{maincol}}{{#2}}\\\\
 \\end{{tabular*}}%
 \\hspace{{4pt}}
 \\begin{{tikzpicture}}[scale=1,rounded corners=2pt,very thin]
  \\fill [lightcol] (0,0) rectangle (1\\mpwidth, 0.15);
  \\fill [maincol] (0,0) rectangle (#3\\mpwidth, 0.15);
 \\end{{tikzpicture}}%
}}

\\newcommand{{\\cvevent}}[7] {{
 \\parbox{{\\mpwidth}}{{
  \\begin{{tabular*}}{{1\\mpwidth}}{{p{{0.78\\mpwidth}}  r}}
    \\textcolor{{black}}{{\\textbf{{#2}}}} & \\colorbox{{maincol}}{{\\makebox[0.20\\mpwidth]{{\\textcolor{{white}}{{#1}}}}}} \\\\
    \\textcolor{{maincol}}{{\\textbf{{#3}}}} & \\\\
  \\end{{tabular*}}\\\\[5pt]
  \\ifthenelse{{\\isempty{{#4}}}}{{}}{{\\cvtext{{#4}}\\\\[5pt]}}
 }}
}}

\\definecolor{{maincol}}{{HTML}}{{008080}}
\\definecolor{{darkcol}}{{HTML}}{{333333}}
\\definecolor{{lightcol}}{{HTML}}{{E5E5E5}}

\\begin{{document}}
\\pagestyle{{fancy}}
\\fancyfoot[L]{{\\small \\textcolor{{black!20!lightcol}}{{Compilation : \\today}}}}
\\fancyfoot[C]{{\\small  \\textcolor{{black!20!lightcol}}{{\\thepage \\hspace{{1pt}} of  \\pageref{{LastPage}}}}}}

\\fcolorbox{{white}}{{lightcol!50}}{{\\begin{{minipage}}[c][3cm][c]{{1\\mpwidth}}
 \\begin {{center}}
  \\HUGE{{ \\textbf{{ \\textcolor{{darkcol}}{{ \\uppercase{{ {name} }} }} }} }} \\\\[-24pt]
  \\textcolor{{darkcol}}{{ \\rule{{0.1\\textwidth}}{{1.25pt}} }} \\\\[4pt]
  \\large{{ \\textcolor{{darkcol}} {{{title}}} }}
 \\end {{center}}
\\end{{minipage}}}} \\\\[14pt]
\\vspace{{12pt}}

\\begin{{paracol}}{{3}}
\\begin{{column}}
\\cvsection{{Contact}}
\\cvtext{{
  \\faMapMarker* \\hspace{{6pt}} {location} \\\\[6pt]
  \\faPhone* \\hspace{{6pt}} {phone} \\\\[6pt]
  \\faEnvelope \\hspace{{6pt}} \\href{{mailto:{email}}}{{{email}}} \\\\[6pt]
  \\faLinkedin \\hspace{{6pt}} \\href{{https://linkedin.com/in/{linkedin}}}{{LinkedIn}} \\\\[6pt]
  \\faGithub \\hspace{{6pt}} \\href{{https://github.com/{github}}}{{GitHub}}
}}
\\end{{column}}

\\begin{{column}}
\\cvsection{{Skills}}
{skills_tex}
\\end{{column}}

\\begin{{column}}
\\cvsection{{About Me}}
\\cvtext{{{summary}}}
\\end{{column}}
\\end{{paracol}}

\\vspace{{14pt}}

{exp_section}
{edu_section}
{proj_section}

\\end{{document}}
"""
    files["cv.tex"] = cv_source
    if "CVmain.tex" in files:
        del files["CVmain.tex"]
    return files


def render_template_9(data: Dict[str, Any], files: Dict[str, str]) -> Dict[str, str]:
    """TCCV Two-Column Adapter."""
    p = data["personal"]
    name = escape_latex(p.get("fullName") or "Your Name")
    email = escape_latex(p.get("email") or "")
    phone = escape_latex(p.get("phone") or "")
    location = escape_latex(p.get("location") or "")
    linkedin = escape_latex(p.get("linkedin") or "")

    exp_tex = ""
    for exp in data.get("experience", []):
        pos = escape_latex(exp.get("position") or "")
        comp = escape_latex(exp.get("company") or "")
        dates = f"{escape_latex(exp.get('startDate') or '')} -- {escape_latex(exp.get('endDate') or ('Present' if exp.get('currentlyWorking') else ''))}"
        desc = escape_latex(exp.get("description") or "")
        exp_tex += (
            f"\\item{{{dates}}}\n"
            f"     {{{comp}}}\n"
            f"     {{{pos}}}\n\n"
            f"{desc}\n\n"
        )

    edu_tex = ""
    for edu in data.get("education", []):
        deg = escape_latex(edu.get("degree") or "")
        field = escape_latex(edu.get("fieldOfStudy") or "")
        inst = escape_latex(edu.get("institution") or "")
        dates = f"{escape_latex(edu.get('startDate') or '')} -- {escape_latex(edu.get('endDate') or '')}"
        edu_tex += (
            f"\\item[{deg}]{{{dates}}}\n"
            f"     {{{field}}}\n"
            f"     {{{inst}}}\n\n"
        )

    skills_list = [escape_latex(s.get("name") or "") for s in data.get("skills", []) if s.get("name")]
    skills_tex = "\n".join([f"\\item{{{s}}}{{}}" for s in skills_list[:12]])

    exp_section = f"\\section{{Work experience}}\n\\begin{{eventlist}}\n{exp_tex}\\end{{eventlist}}\n" if exp_tex else ""
    edu_section = f"\\section{{Education}}\n\\begin{{yearlist}}\n{edu_tex}\\end{{yearlist}}\n" if edu_tex else ""
    skills_section = f"\\section{{Technical Skills}}\n\\begin{{factlist}}\n{skills_tex}\n\\end{{factlist}}\n" if skills_tex else ""

    cv_source = f"""\\documentclass{{tccv}}
\\usepackage[english]{{babel}}
\\usepackage[utf8]{{inputenc}}

\\begin{{document}}

\\part{{{name}}}

{exp_section}
{edu_section}

\\personal
    [{linkedin}]
    {{{location}}}
    {{{phone}}}
    {{{email}}}

{skills_section}

\\end{{document}}
"""
    files["cv.tex"] = cv_source
    if "tccv.tex" in files:
        del files["tccv.tex"]
    return files


# ── Generic Dispatcher ────────────────────────────────────────────────────────

def render_resume_to_latex(template_id: str, raw_data: Dict[str, Any]) -> Dict[str, str]:
    """
    Main entry point: Loads template files and applies the matching template adapter.
    """
    clean_data = normalize_resume_data(raw_data)
    template_files = read_master_template_files(str(template_id))

    tpl_str = str(template_id)
    if tpl_str == "1":
        return render_template_1(clean_data, template_files)
    elif tpl_str == "2":
        return render_template_2(clean_data, template_files)
    elif tpl_str == "3":
        return render_template_3(clean_data, template_files)
    elif tpl_str == "4":
        return render_template_4(clean_data, template_files)
    elif tpl_str == "5":
        return render_template_5(clean_data, template_files)
    elif tpl_str == "6":
        return render_template_6(clean_data, template_files)
    elif tpl_str == "7":
        return render_template_7(clean_data, template_files)
    elif tpl_str == "8":
        return render_template_8(clean_data, template_files)
    elif tpl_str == "9":
        return render_template_9(clean_data, template_files)
    else:
        return render_template_4(clean_data, template_files)


def get_original_template_files(template_id: str) -> Dict[str, str]:
    """Reads original template files and renames the entrypoint to cv.tex for compilation."""
    files = read_master_template_files(str(template_id))
    
    rename_rules = {
        "1": "sample.tex",
        "2": "cv-llt.tex",
        "3": "MBZUAI Resume template.tex",
        "4": "main.tex",
        "5": "sixtysecondscv.tex",
        "6": "main.tex",
        "7": "main.tex",
        "8": "CVmain.tex",
        "9": "tccv.tex"
    }
    
    entry = rename_rules.get(str(template_id))
    if entry and entry in files:
        files["cv.tex"] = files.pop(entry)
        
    return files

