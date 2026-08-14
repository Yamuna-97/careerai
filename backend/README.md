# CareerAI — FastAPI Backend

Production-ready backend for the **CareerAI Resume Builder** platform.
Built with **FastAPI + SQLAlchemy + Supabase PostgreSQL**.

---

## Tech Stack

| Component | Technology |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn |
| Database | Supabase PostgreSQL |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Auth | Supabase JWT validation |
| PDF Export | ReportLab |
| Python | 3.11 |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                  ← FastAPI app entry point
│   ├── api/
│   │   ├── router.py            ← Combines all routes
│   │   └── routes/
│   │       ├── auth.py          ← POST /auth/sync, GET /auth/me
│   │       ├── users.py         ← GET/PUT /users/me
│   │       ├── resumes.py       ← Resume CRUD + completion + stats
│   │       ├── sections.py      ← Education, Experience, Projects, Skills, Certifications, Achievements
│   │       ├── templates.py     ← GET /templates
│   │       ├── ai.py            ← AI improvement endpoints
│   │       ├── ats.py           ← ATS scoring
│   │       └── export.py        ← PDF export
│   ├── core/
│   │   ├── config.py            ← Settings from .env
│   │   ├── database.py          ← SQLAlchemy engine + session
│   │   └── security.py          ← Supabase JWT validation
│   ├── models/                  ← SQLAlchemy database models
│   ├── schemas/                 ← Pydantic request/response schemas
│   ├── services/                ← Business logic
│   └── utils/                   ← Helper functions
├── alembic/                     ← Database migrations
├── .env                         ← Local secrets (NOT in Git)
├── .env.example                 ← Template (in Git)
├── requirements.txt
└── alembic.ini
```

---

## Setup Guide

### Step 1 — Activate Conda Environment

```bash
conda activate careerai
```

### Step 2 — Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 3 — Configure Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
copy .env.example .env
```

Open `.env` and fill in:

```env
DATABASE_URL=postgresql+psycopg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

**Where to find these in Supabase:**
- `DATABASE_URL` → Settings → Database → Connection string → URI
- `SUPABASE_URL` and `SUPABASE_KEY` → Settings → API
- `SUPABASE_JWT_SECRET` → Settings → API → JWT Secret

### Step 4 — Run Database Migrations

This creates all the tables in your Supabase PostgreSQL database:

```bash
alembic upgrade head
```

To generate a new migration after changing models:

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

### Step 5 — Start the Development Server

```bash
uvicorn app.main:app --reload
```

The API will be available at: `http://localhost:8000`

### Step 6 — Open API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Step 7 — Test the Health Endpoint

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy", "version": "1.0.0"}
```

Database health:
```bash
curl http://localhost:8000/health/db
```

---

## API Overview

All routes are prefixed with `/api/v1/`.

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/sync` | Sync Supabase user to local DB |
| GET | `/api/v1/auth/me` | Get current user |

### Resumes
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/resumes` | List all my resumes |
| POST | `/api/v1/resumes` | Create a resume |
| GET | `/api/v1/resumes/{id}` | Get full resume |
| PUT | `/api/v1/resumes/{id}` | Update resume |
| DELETE | `/api/v1/resumes/{id}` | Delete resume |
| POST | `/api/v1/resumes/{id}/duplicate` | Duplicate resume |
| GET | `/api/v1/resumes/{id}/completion` | Completion % |
| GET | `/api/v1/resumes/{id}/stats` | Dashboard stats |
| GET | `/api/v1/resumes/{id}/export/pdf` | Download PDF |

### Resume Sections (same pattern for all)
```
GET    /api/v1/resumes/{id}/education
POST   /api/v1/resumes/{id}/education
PUT    /api/v1/resumes/{id}/education/{item_id}
DELETE /api/v1/resumes/{id}/education/{item_id}
```
Available sections: `education`, `experience`, `projects`, `skills`, `certifications`, `achievements`

### Other
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/templates` | List templates |
| GET | `/api/v1/ats/score/{id}` | ATS score |
| POST | `/api/v1/ai/improve-summary` | AI improvement |

---

## Authentication

The backend validates **Supabase JWT tokens**.

On the frontend, after the user logs in with Supabase, pass the token in every API request:

```js
headers: {
  Authorization: `Bearer ${supabaseSession.access_token}`
}
```

The backend reads the user's identity from the token — it never trusts `user_id` sent in the request body.

---

## Enabling AI Features

By default, AI endpoints return a `"provider_not_configured"` message.

To enable real AI features, edit `.env`:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

Then implement the provider calls in `app/services/ai_service.py`.

---

## Common Commands

```bash
# Start dev server
uvicorn app.main:app --reload

# Create new migration
alembic revision --autogenerate -m "add new column"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# View migration history
alembic history
```
