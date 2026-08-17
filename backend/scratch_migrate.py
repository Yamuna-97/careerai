from sqlalchemy import create_engine, text
from app.core.database import db_url, _scrub_password

if db_url.startswith("sqlite"):
    print("[!] Local SQLite is active. Cannot run PostgreSQL migrations.")
else:
    print(f"[*] Connecting to database to apply migration: {_scrub_password(db_url)}")
    engine = create_engine(db_url)
    
    # Read/define migration SQL queries
    cleanup_sql = """
    DROP TABLE IF EXISTS public.latex_project_files CASCADE;
    DROP TABLE IF EXISTS public.latex_projects CASCADE;
    DROP TABLE IF EXISTS public.education CASCADE;
    DROP TABLE IF EXISTS public.experience CASCADE;
    DROP TABLE IF EXISTS public.projects CASCADE;
    DROP TABLE IF EXISTS public.skills CASCADE;
    DROP TABLE IF EXISTS public.certifications CASCADE;
    DROP TABLE IF EXISTS public.achievements CASCADE;
    DROP TABLE IF EXISTS public.resumes CASCADE;
    DROP TABLE IF EXISTS public.interview_answers CASCADE;
    DROP TABLE IF EXISTS public.interview_questions CASCADE;
    DROP TABLE IF EXISTS public.interview_sessions CASCADE;
    DROP TABLE IF EXISTS public.job_applications CASCADE;
    DROP TABLE IF EXISTS public.saved_jobs CASCADE;
    DROP TABLE IF EXISTS public.job_search_profiles CASCADE;
    DROP TABLE IF EXISTS public.job_search_history CASCADE;
    DROP TABLE IF EXISTS public.top_five_jobs_cache CASCADE;
    """
    
    create_tables_sql = """
    -- 1. Create Resumes Parent Table
    CREATE TABLE IF NOT EXISTS public.resumes (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL DEFAULT 'My Resume',
        template VARCHAR(50) NOT NULL DEFAULT 'modern',
        full_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        location VARCHAR(255),
        linkedin VARCHAR(500),
        github VARCHAR(500),
        portfolio VARCHAR(500),
        profile_image VARCHAR(1000),
        summary TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);

    -- 2. Create Resume Section Tables
    CREATE TABLE IF NOT EXISTS public.education (
        id VARCHAR(36) PRIMARY KEY,
        resume_id VARCHAR(36) NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
        institution VARCHAR(255) NOT NULL,
        degree VARCHAR(255),
        field_of_study VARCHAR(255),
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        grade VARCHAR(50),
        description TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_education_resume_id ON public.education(resume_id);

    CREATE TABLE IF NOT EXISTS public.experience (
        id VARCHAR(36) PRIMARY KEY,
        resume_id VARCHAR(36) NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
        company VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        currently_working BOOLEAN NOT NULL DEFAULT FALSE,
        description TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_experience_resume_id ON public.experience(resume_id);

    CREATE TABLE IF NOT EXISTS public.projects (
        id VARCHAR(36) PRIMARY KEY,
        resume_id VARCHAR(36) NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        technologies VARCHAR(1000),
        github_url VARCHAR(500),
        live_url VARCHAR(500),
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_projects_resume_id ON public.projects(resume_id);

    CREATE TABLE IF NOT EXISTS public.skills (
        id VARCHAR(36) PRIMARY KEY,
        resume_id VARCHAR(36) NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Other',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_skills_resume_id ON public.skills(resume_id);

    CREATE TABLE IF NOT EXISTS public.certifications (
        id VARCHAR(36) PRIMARY KEY,
        resume_id VARCHAR(36) NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        issuer VARCHAR(255),
        issue_date VARCHAR(50),
        credential_url VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_certifications_resume_id ON public.certifications(resume_id);

    CREATE TABLE IF NOT EXISTS public.achievements (
        id VARCHAR(36) PRIMARY KEY,
        resume_id VARCHAR(36) NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date VARCHAR(50),
        organization VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_achievements_resume_id ON public.achievements(resume_id);

    -- 3. Create mock Interviews Tables
    CREATE TABLE IF NOT EXISTS public.interview_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        role VARCHAR(255) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        interview_type VARCHAR(50) NOT NULL,
        format VARCHAR(50) NOT NULL DEFAULT 'text',
        num_questions INTEGER DEFAULT 5,
        duration INTEGER DEFAULT 15,
        status VARCHAR(50) DEFAULT 'in_progress',
        job_company VARCHAR(255),
        job_title VARCHAR(255),
        job_description TEXT,
        language VARCHAR(50),
        topic VARCHAR(100),
        overall_score INTEGER,
        technical_score INTEGER,
        communication_score INTEGER,
        confidence_score INTEGER,
        problem_solving_score INTEGER,
        relevance_score INTEGER,
        strengths TEXT,
        weaknesses TEXT,
        improvement_plan TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);

    CREATE TABLE IF NOT EXISTS public.interview_questions (
        id VARCHAR(36) PRIMARY KEY,
        session_id VARCHAR(36) NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        hint TEXT,
        better_answer TEXT,
        coding_metadata TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_interview_questions_session_id ON public.interview_questions(session_id);

    CREATE TABLE IF NOT EXISTS public.interview_answers (
        id VARCHAR(36) PRIMARY KEY,
        question_id VARCHAR(36) NOT NULL UNIQUE REFERENCES public.interview_questions(id) ON DELETE CASCADE,
        answer_text TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        technical_accuracy INTEGER NOT NULL DEFAULT 0,
        relevance INTEGER NOT NULL DEFAULT 0,
        clarity INTEGER NOT NULL DEFAULT 0,
        structure INTEGER NOT NULL DEFAULT 0,
        communication INTEGER NOT NULL DEFAULT 0,
        completeness INTEGER NOT NULL DEFAULT 0,
        star_situation BOOLEAN NOT NULL DEFAULT FALSE,
        star_task BOOLEAN NOT NULL DEFAULT FALSE,
        star_action BOOLEAN NOT NULL DEFAULT FALSE,
        star_result BOOLEAN NOT NULL DEFAULT FALSE,
        strengths_feedback TEXT,
        weaknesses_feedback TEXT,
        suggestions_feedback TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 4. Create Job Board Tables
    CREATE TABLE IF NOT EXISTS public.job_search_profiles (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
        target_roles JSONB DEFAULT '[]'::jsonb,
        skills JSONB DEFAULT '[]'::jsonb,
        keywords JSONB DEFAULT '[]'::jsonb,
        experience_level VARCHAR(50) DEFAULT 'any',
        current_title VARCHAR(255) DEFAULT '',
        education_level VARCHAR(255) DEFAULT '',
        locations JSONB DEFAULT '[]'::jsonb,
        work_modes JSONB DEFAULT '[]'::jsonb,
        employment_types JSONB DEFAULT '[]'::jsonb,
        country_code VARCHAR(10) DEFAULT 'in',
        salary_min INTEGER,
        salary_max INTEGER,
        salary_currency VARCHAR(10) DEFAULT 'INR',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_job_search_profiles_user ON public.job_search_profiles(user_id);

    CREATE TABLE IF NOT EXISTS public.saved_jobs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        profile_id VARCHAR(36) REFERENCES public.job_search_profiles(id) ON DELETE SET NULL,
        external_job_id VARCHAR(255),
        source VARCHAR(50) DEFAULT 'jsearch',
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) DEFAULT '',
        location VARCHAR(255) DEFAULT '',
        description TEXT DEFAULT '',
        url TEXT DEFAULT '',
        salary_min DOUBLE PRECISION,
        salary_max DOUBLE PRECISION,
        salary_display VARCHAR(255) DEFAULT '',
        employment_type VARCHAR(50) DEFAULT '',
        work_mode VARCHAR(50) DEFAULT '',
        category VARCHAR(255) DEFAULT '',
        posted_date VARCHAR(50) DEFAULT '',
        match_score DOUBLE PRECISION DEFAULT 0.0,
        matched_skills JSONB DEFAULT '[]'::jsonb,
        missing_skills JSONB DEFAULT '[]'::jsonb,
        match_reasons JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_external_id ON public.saved_jobs(external_job_id);

    CREATE TABLE IF NOT EXISTS public.job_applications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        saved_job_id VARCHAR(36) NOT NULL UNIQUE REFERENCES public.saved_jobs(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'saved',
        notes TEXT DEFAULT '',
        applied_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);

    CREATE TABLE IF NOT EXISTS public.job_search_history (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        query VARCHAR(255) DEFAULT '',
        location VARCHAR(255) DEFAULT '',
        filters JSONB DEFAULT '{}'::jsonb,
        results_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_job_search_history_user ON public.job_search_history(user_id);

    CREATE TABLE IF NOT EXISTS public.top_five_jobs_cache (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        period VARCHAR(50) NOT NULL,
        jobs_json JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT uq_user_year_month UNIQUE (user_id, year, month)
    );
    CREATE INDEX IF NOT EXISTS idx_top_five_jobs_cache_user ON public.top_five_jobs_cache(user_id);
    """
    
    rls_sql = """
    -- Enable RLS
    ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.job_search_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.job_search_history ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.top_five_jobs_cache ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist to avoid collision
    DROP POLICY IF EXISTS "Users can manage their own resumes" ON public.resumes;
    DROP POLICY IF EXISTS "Users can manage their resume education" ON public.education;
    DROP POLICY IF EXISTS "Users can manage their resume experience" ON public.experience;
    DROP POLICY IF EXISTS "Users can manage their resume projects" ON public.projects;
    DROP POLICY IF EXISTS "Users can manage their resume skills" ON public.skills;
    DROP POLICY IF EXISTS "Users can manage their resume certifications" ON public.certifications;
    DROP POLICY IF EXISTS "Users can manage their resume achievements" ON public.achievements;
    DROP POLICY IF EXISTS "Users can manage their interview sessions" ON public.interview_sessions;
    DROP POLICY IF EXISTS "Users can manage their interview questions" ON public.interview_questions;
    DROP POLICY IF EXISTS "Users can manage their interview answers" ON public.interview_answers;
    DROP POLICY IF EXISTS "Users can manage their job search profile" ON public.job_search_profiles;
    DROP POLICY IF EXISTS "Users can manage their saved jobs" ON public.saved_jobs;
    DROP POLICY IF EXISTS "Users can manage their job applications" ON public.job_applications;
    DROP POLICY IF EXISTS "Users can manage their search history" ON public.job_search_history;
    DROP POLICY IF EXISTS "Users can manage their top five cache" ON public.top_five_jobs_cache;

    -- Create RLS Policies
    CREATE POLICY "Users can manage their own resumes" ON public.resumes
        FOR ALL USING (auth.uid()::text = user_id);

    CREATE POLICY "Users can manage their resume education" ON public.education
        FOR ALL USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = education.resume_id AND resumes.user_id = auth.uid()::text));

    CREATE POLICY "Users can manage their resume experience" ON public.experience
        FOR ALL USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = experience.resume_id AND resumes.user_id = auth.uid()::text));

    CREATE POLICY "Users can manage their resume projects" ON public.projects
        FOR ALL USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = projects.resume_id AND resumes.user_id = auth.uid()::text));

    CREATE POLICY "Users can manage their resume skills" ON public.skills
        FOR ALL USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = skills.resume_id AND resumes.user_id = auth.uid()::text));

    CREATE POLICY "Users can manage their resume certifications" ON public.certifications
        FOR ALL USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = certifications.resume_id AND resumes.user_id = auth.uid()::text));

    CREATE POLICY "Users can manage their resume achievements" ON public.achievements
        FOR ALL USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = achievements.resume_id AND resumes.user_id = auth.uid()::text));

    CREATE POLICY "Users can manage their interview sessions" ON public.interview_sessions
        FOR ALL USING (auth.uid()::text = user_id);

    CREATE POLICY "Users can manage their interview questions" ON public.interview_questions
        FOR ALL USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE interview_sessions.id = interview_questions.session_id AND interview_sessions.user_id = auth.uid()::text));

    CREATE POLICY "Users can manage their interview answers" ON public.interview_answers
        FOR ALL USING (EXISTS (
            SELECT 1 FROM public.interview_questions 
            JOIN public.interview_sessions ON interview_sessions.id = interview_questions.session_id 
            WHERE interview_questions.id = interview_answers.question_id AND interview_sessions.user_id = auth.uid()::text
        ));

    CREATE POLICY "Users can manage their job search profile" ON public.job_search_profiles
        FOR ALL USING (auth.uid()::text = user_id);

    CREATE POLICY "Users can manage their saved jobs" ON public.saved_jobs
        FOR ALL USING (auth.uid()::text = user_id);

    CREATE POLICY "Users can manage their job applications" ON public.job_applications
        FOR ALL USING (auth.uid()::text = user_id);

    CREATE POLICY "Users can manage their search history" ON public.job_search_history
        FOR ALL USING (auth.uid()::text = user_id);

    CREATE POLICY "Users can manage their top five cache" ON public.top_five_jobs_cache
        FOR ALL USING (auth.uid()::text = user_id);
    """
    
    with engine.begin() as conn:
        print("[*] Dropping legacy tables...")
        conn.execute(text(cleanup_sql))
        print("[*] Creating new database schemas...")
        conn.execute(text(create_tables_sql))
        print("[*] Enabling Row Level Security (RLS) & policies...")
        conn.execute(text(rls_sql))
        print("[*] Migration completed successfully!")
    
    engine.dispose()
