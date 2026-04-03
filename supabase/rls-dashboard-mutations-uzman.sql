-- Uzman paneli: eğitim ve şirket düzenleme / silme (UPDATE, DELETE)
-- Önce fix-rls-courses-recursion.sql (course_owned_by_user) çalışmış olmalı.
-- Supabase SQL Editor'da bir kez çalıştırın.

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;

-- courses UPDATE
DROP POLICY IF EXISTS "courses_update_uzman_admin" ON public.courses;

CREATE POLICY "courses_update_uzman_admin"
  ON public.courses
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

-- courses DELETE (course_assignments + quizzes CASCADE)
DROP POLICY IF EXISTS "courses_delete_uzman_admin" ON public.courses;

CREATE POLICY "courses_delete_uzman_admin"
  ON public.courses
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

-- course_assignments DELETE: kurs silinince veya şirket silinince CASCADE
DROP POLICY IF EXISTS "course_assignments_delete_by_creator_or_admin" ON public.course_assignments;

CREATE POLICY "course_assignments_delete_by_creator_or_admin"
  ON public.course_assignments
  FOR DELETE
  TO authenticated
  USING (
    public.course_owned_by_user(course_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.companies AS co
      WHERE co.id = course_assignments.company_id
        AND co.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

-- companies UPDATE
DROP POLICY IF EXISTS "companies_update_uzman_admin" ON public.companies;

CREATE POLICY "companies_update_uzman_admin"
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR public.auth_is_admin())
  WITH CHECK (created_by = auth.uid() OR public.auth_is_admin());

-- companies DELETE
DROP POLICY IF EXISTS "companies_delete_uzman_admin" ON public.companies;

CREATE POLICY "companies_delete_uzman_admin"
  ON public.companies
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR public.auth_is_admin());
