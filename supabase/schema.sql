-- Kalibre Akademi — Supabase SQL Editor'da çalıştırın (yeni proje / sıfırdan şema).
-- Mevcut projede geçiş için: migration-course-assignments.sql

CREATE TYPE public.user_role AS ENUM ('ADMIN', 'UZMAN', 'WORKER');

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_created_by ON public.companies (created_by);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'WORKER',
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  isg_license_number TEXT
);

-- Kurs içeriği şirketten bağımsız; şirket eşlemesi course_assignments üzerinden
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT,
  specialist_name TEXT,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL
);

-- Şirket silinince yalnızca bu tablodaki eşleşmeler gider; courses satırları kalır.
CREATE TABLE public.course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, company_id)
);

CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score INTEGER NOT NULL DEFAULT 70,
  UNIQUE (course_id)
);

CREATE INDEX idx_profiles_company_id ON public.profiles (company_id);
CREATE INDEX idx_courses_created_by ON public.courses (created_by);
CREATE INDEX idx_course_assignments_course_id ON public.course_assignments (course_id);
CREATE INDEX idx_course_assignments_company_id ON public.course_assignments (company_id);
CREATE INDEX idx_quizzes_course_id ON public.quizzes (course_id);

CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes (id) ON DELETE SET NULL,
  score NUMERIC(5, 2) NOT NULL,
  passed BOOLEAN NOT NULL,
  correct_count INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_results_user_id ON public.quiz_results (user_id);
CREATE INDEX idx_quiz_results_course_id ON public.quiz_results (course_id);
CREATE INDEX idx_quiz_results_user_course ON public.quiz_results (user_id, course_id);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
