-- Kurs ↔ şirket hiyerarşisi: course_assignments + courses.created_by
-- Mevcut veritabanında BİR KEZ Supabase SQL Editor'da çalıştırın.
-- Sıfırdan kurulum için güncel tanım: schema.sql

-- 1) Atama tablosu
CREATE TABLE IF NOT EXISTS public.course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_course_assignments_course_id
  ON public.course_assignments (course_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_company_id
  ON public.course_assignments (company_id);

-- 2) Eski courses.company_id verisini atamalara taşı
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'courses'
      AND column_name = 'company_id'
  ) THEN
    INSERT INTO public.course_assignments (course_id, company_id, assigned_at)
    SELECT id, company_id, now()
    FROM public.courses
    WHERE company_id IS NOT NULL
    ON CONFLICT (course_id, company_id) DO NOTHING;
  END IF;
END $$;

-- 3) Kursu oluşturan uzman (profiles)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_created_by ON public.courses (created_by);

-- 4) courses.company_id kaldır
ALTER TABLE public.courses DROP COLUMN IF EXISTS company_id;

DROP INDEX IF EXISTS idx_courses_company_id;
