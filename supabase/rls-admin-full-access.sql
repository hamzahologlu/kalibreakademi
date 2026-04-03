-- ADMIN: tüm kurslar, atamalar, profiller (sistem geneli okuma + atama yazma)
-- course_owned_by_user + user_worker_sees_course (fix-rls-courses-recursion) gerekli.
-- Supabase SQL Editor’da bir kez çalıştırın.

CREATE OR REPLACE FUNCTION public.auth_is_uzman_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT p.role IN ('UZMAN', 'ADMIN')
      FROM public.profiles AS p
      WHERE p.id = auth.uid()
    ),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.auth_is_uzman_or_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_uzman_or_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.auth_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.role = 'ADMIN' FROM public.profiles p WHERE p.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.auth_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_admin() TO authenticated;

-- Kursları sistemdeki tüm kayıtlar (admin önizleme + panel)
DROP POLICY IF EXISTS "courses_select_worker_or_creator" ON public.courses;

CREATE POLICY "courses_select_worker_or_creator"
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.user_worker_sees_course(id)
    OR public.auth_is_admin()
  );

-- Atama satırlarını admin tüm kurslar için görsün
DROP POLICY IF EXISTS "course_assignments_select_for_creator" ON public.course_assignments;

CREATE POLICY "course_assignments_select_for_creator"
  ON public.course_assignments
  FOR SELECT
  TO authenticated
  USING (
    public.course_owned_by_user(course_id, auth.uid())
    OR public.auth_is_admin()
  );

-- Admin başka uzmanın kursuna da şirket atayabilsin
DROP POLICY IF EXISTS "course_assignments_insert_by_creator" ON public.course_assignments;

CREATE POLICY "course_assignments_insert_by_creator"
  ON public.course_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.auth_is_uzman_or_admin()
    AND (
      public.course_owned_by_user(course_id, auth.uid())
      OR public.auth_is_admin()
    )
  );

-- Tüm profiller (personel + uzman + diğer admin) — yalnızca ADMIN
DROP POLICY IF EXISTS "profiles_select_admin_all" ON public.profiles;

CREATE POLICY "profiles_select_admin_all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.auth_is_admin());
