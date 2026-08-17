<div align="center">

# 🚀 CareerAI — Next-Gen AI Career Development Platform

### *An Intelligent, End-to-End Career Acceleration Ecosystem Powered by Google Gemini AI, Supabase & FastAPI*

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Google_Gemini-Flash_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
</p>

</div>

---

## 📑 Table of Contents
- [🏗️ System Architecture](#️-system-architecture)
- [💻 Tech Stack](#-tech-stack)
- [✨ Core Capabilities](#-core-capabilities)
- [🗄️ Database & Security Architecture](#️-database--security-architecture)
- [🚀 Quick Start & Installation](#-quick-start--installation)
  - [1. Supabase Database Setup](#1-supabase-database-setup)
  - [2. Backend Setup (FastAPI)](#2-backend-setup-fastapi)
  - [3. Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
- [🌐 Environment Variables](#-environment-variables)
- [🔒 Security & Production Integrity](#-security--production-integrity)

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    %% ================= CLIENT LAYER =================
    subgraph Client["🖥️ Client Layer (Frontend)"]
        direction TB
        ReactApp["React 18 + Vite SPA<br/><i>(Tailwind CSS • Framer Motion • Lucide)</i>"]
        MonacoEditor["Monaco LaTeX Code Editor<br/><i>(Syntax Highlighting • Real-time Sync)</i>"]
        AuthContext["Supabase Auth Client<br/><i>(JWT Storage • Session Management)</i>"]
    end

    %% ================= BACKEND LAYER =================
    subgraph Backend["⚡ API & Application Layer (FastAPI Backend)"]
        direction TB
        APIServer["FastAPI Application Server<br/><code>/api/v1</code>"]
        
        AuthMiddleware["Supabase JWT Auth Middleware<br/><i>(ES256 JWKS Key Verification)</i>"]
        
        subgraph Services["Core Application Services"]
            ResumeParser["PDF Resume Parser<br/><i>(PyPDF / Text Extraction)</i>"]
            PromptEngine["AI Prompt Engineering Engine<br/><i>(Resume Enhancement • ATS Scoring)</i>"]
            InterviewService["Live Mock Interview Engine<br/><i>(Adaptive Questions • STAR Scoring)</i>"]
            LaTeXCompiler["LaTeX Compilation Worker<br/><i>(Tectonic / pdflatex Engine)</i>"]
            JobMatcher["Job Matching & Score Algorithm<br/><i>(JSearch Integration • Skills Vector)</i>"]
        end
    end

    %% ================= PERSISTENCE LAYER =================
    subgraph Persistence["🗄️ Persistence Layer (Supabase Single Source of Truth)"]
        direction TB
        SupaAuth["Supabase Authentication<br/><i>(OAuth • Email / Password • JWTs)</i>"]
        SupaDB[("Supabase PostgreSQL DB<br/><i>(17 Relational Tables)</i>")]
        RLSPolicies["Row Level Security (RLS) Policies<br/><i>(User-isolated Data Sandboxing)</i>"]
    end

    %% ================= EXTERNAL SERVICES =================
    subgraph External["🌐 AI & External Services Layer"]
        direction TB
        GeminiAPI["Google Gemini AI API<br/><i>(gemini-2.5-flash / gemini-1.5-pro)</i>"]
        JSearchAPI["JSearch RapidAPI Service<br/><i>(Real-Time Global Job Feed)</i>"]
        PDFGen["ReportLab PDF Export Engine"]
    end

    %% ================= FLOW CONNECTIONS =================
    AuthContext -->|"Auth & Session Sync"| SupaAuth
    ReactApp -->|"REST API Calls + Bearer JWT"| APIServer
    MonacoEditor -->|"Sync LaTeX Source"| APIServer

    APIServer --> AuthMiddleware
    AuthMiddleware -->|"Validate JWT Claims"| SupaAuth

    APIServer --> ResumeParser
    APIServer --> PromptEngine
    APIServer --> InterviewService
    APIServer --> LaTeXCompiler
    APIServer --> JobMatcher

    PromptEngine -->|"Prompt / Response"| GeminiAPI
    InterviewService -->|"Question & Evaluation Generation"| GeminiAPI
    LaTeXCompiler -->|"AI LaTeX Debugging"| GeminiAPI
    JobMatcher -->|"Live Job Search Query"| JSearchAPI
    ResumeParser --> PDFGen

    APIServer -->|"SQLAlchemy 2.0 Pooler Connection"| SupaDB
    SupaDB --- RLSPolicies

    %% Styling
    classDef client fill:#1e293b,stroke:#61DAFB,stroke-width:2px,color:#fff;
    classDef backend fill:#0f172a,stroke:#009688,stroke-width:2px,color:#fff;
    classDef database fill:#022c22,stroke:#3ECF8E,stroke-width:2px,color:#fff;
    classDef external fill:#1e1b4b,stroke:#4285F4,stroke-width:2px,color:#fff;

    class Client,ReactApp,MonacoEditor,AuthContext client;
    class Backend,APIServer,AuthMiddleware,Services,ResumeParser,PromptEngine,InterviewService,LaTeXCompiler,JobMatcher backend;
    class Persistence,SupaAuth,SupaDB,RLSPolicies database;
    class External,GeminiAPI,JSearchAPI,PDFGen external;
```

---

## 💻 Tech Stack

### Frontend Client
- **Framework**: React 18 (Vite 6)
- **Styling**: Tailwind CSS, Material Symbols, Lucide React Icons
- **Code & LaTeX Editing**: Monaco Editor (`@monaco-editor/react`)
- **Animation & Transitions**: Framer Motion
- **HTTP Client**: Axios with centralized Bearer JWT interceptor & auto-recovery
- **State & Storage**: Supabase Auth State, REST synchronization

### Backend Server
- **Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn ASGI
- **ORM & Database Client**: SQLAlchemy 2.0 + Psycopg (PostgreSQL pooler integration)
- **Validation**: Pydantic v2
- **Document Processing**: ReportLab, PyPDF
- **Testing**: Pytest

### Cloud, Database & AI
- **Database**: Supabase Managed PostgreSQL with Connection Pooling (AWS AP-Northeast)
- **Authentication**: Supabase Auth (ES256 asymmetric JWKS verification & HS256 fallback)
- **Security**: Row Level Security (RLS) policies on all tables
- **AI Intelligence**: Google Gemini API (`gemini-2.5-flash-lite`, `gemini-1.5-pro`)
- **External Data**: JSearch Job Search API (LinkedIn, Indeed, Glassdoor aggregator)

---

## ✨ Core Capabilities

### 📄 1. Interactive Resume Builder & AI Studio
- **9+ Professional Templates**: Modern, Minimal, Executive, Creative, Tech, Elegant, and ATS-Optimized layouts.
- **AI Rewrite & Tailoring**: Instant bullet point enhancement, tone adjustment, and ATS keyword matching against target job descriptions.
- **Live Scoring**: Real-time completeness metrics, ATS pass-rate score, and structural analysis.

### 📐 2. Overleaf-Grade LaTeX Studio
- **Multi-File Project Management**: Structure LaTeX documents with `cv.tex`, styles, and preamble modules.
- **Live Compilation**: Real-time PDF rendering with error logging and line-by-line inspection.
- **AI Error Fixer**: Automatically parses compilation warnings and LaTeX syntax errors to suggest 1-click fixes.

### 🎙️ 3. Live AI Mock Interview Coach
- **Dynamic Question Engine**: Generates role-specific, difficulty-tuned, non-repetitive interview sessions.
- **STAR Evaluation Matrix**: Evaluates Situation, Task, Action, and Result dimensions with targeted scorecards.
- **Speech & Text Mode**: Interactive voice or text responses with real-time feedback and remediation roadmap.

### 💼 4. Smart Job Discovery & Application Pipeline
- **Real-Time Job Aggregation**: Live searches across global tech listings via JSearch.
- **Resume Match Score**: Computes cosine and keyword overlap between user resume skills and job requirements.
- **Application Tracker**: Kanban pipeline to manage applications (`Saved`, `Applied`, `Interviewing`, `Offered`, `Archived`).

---

## 🗄️ Database & Security Architecture

The platform uses **Supabase PostgreSQL** as its exclusive, single source of truth across **17 relational tables**:

```text
├── users                        ← Core user profiles & credentials
├── resumes                      ← Master resume documents & metadata
│   ├── resume_experiences       ← Work history & achievements
│   ├── resume_educations        ← Degrees, institutions & GPAs
│   ├── resume_projects          ← Project portfolios & links
│   ├── resume_skills            ← Categorized technical/soft skills
│   ├── resume_certifications    ← Professional licenses & credentials
│   └── resume_achievements      ← Honors & recognitions
├── interview_sessions           ← Mock interview metadata & scores
│   ├── interview_questions      ← Session questions & STAR criteria
│   └── interview_answers        ← User transcripts, scores & AI feedback
├── latex_projects               ← LaTeX document projects
│   └── latex_project_files      ← Source files (.tex, .cls, .bib)
├── job_applications             ← Tracked job application statuses
├── job_search_history           ← Search queries & filter preferences
├── saved_jobs                   ← Bookmarked job postings
└── top_five_jobs_cache          ← Cached high-relevance job matches
```

### Row Level Security (RLS)
Every table is locked down with PostgreSQL RLS policies ensuring that users can only query, insert, update, or delete records belonging to their own `auth.uid()`.

---

## 🚀 Quick Start & Installation

### 1. Supabase Database Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor** in your Supabase dashboard.
3. Open [`backend/supabase_schema.sql`](file:///d:/careerai/backend/supabase_schema.sql), paste the entire script, and execute it to build all 17 tables, indexes, and RLS policies.

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env     # Windows
# cp .env.example .env     # macOS/Linux
```

Configure `backend/.env` with your API keys:
```env
DATABASE_URL=postgresql+psycopg://postgres.[REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
JSEARCH_API_KEY=your_jsearch_api_key
```

Run backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Configure environment variables
copy .env.example .env     # Windows
# cp .env.example .env     # macOS/Linux
```

Configure `frontend/.env`:
```env
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000/api/v1
```

Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL URI (connection pooler recommended) |
| `SUPABASE_URL` | Supabase project API endpoint URL |
| `SUPABASE_KEY` | Supabase project anonymous public key |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret for validating access tokens |
| `SUPABASE_JWKS_URL` | Optional: Direct JWKS URL for ES256 asymmetric signature verification |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `JSEARCH_API_KEY` | RapidAPI JSearch key for live job feeds |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project API URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase project anonymous public key |
| `VITE_API_URL` | FastAPI backend base URL (`http://localhost:8000/api/v1`) |

---

## 🔒 Security & Production Integrity
- **Zero Secrets in Version Control**: All `.env` files, credentials, and API keys are strictly excluded via `.gitignore`.
- **JWT Cryptographic Verification**: FastAPI backend verifies Supabase access token signatures (ES256 JWKS or HS256) on every protected endpoint.
- **Isolated Storage**: Local database files (`careerai.db`, `.sqlite`) and `localStorage` mock caches have been removed in favor of Supabase PostgreSQL.
- **Production Build Validated**: Fully tested with `pytest` (backend) and `vite build` (frontend).

---

<div align="center">
  <sub>Built with ❤️ for modern software engineers, job seekers, and career changers.</sub>
</div>
