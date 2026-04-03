-- RBAC: Uzman — kendi kurslarını görme, şirket listesi, course_assignments ekleme
-- NOT: courses ↔ course_assignments doğrudan alt sorgu RLS döngüsü yapar;
-- aşağıdaki SECURITY DEFINER fonksiyonları kullanılır.

CREATE OR REPLACE FUNCTION public.course_owned_by_user(p_course_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.courses AS c
    WHERE c.id = p_course_id
      AND c.created_by = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.user_worker_sees_course(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_assignments AS ca
    INNER JOIN public.profiles AS p
      ON p.id = auth.uid()
     AND p.company_id IS NOT NULL
     AND p.company_id = ca.company_id
    WHERE ca.course_id = p_course_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.course_owned_by_user(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_worker_sees_course(uuid) TO authenticated;

-- Uzman/Admin rolü (companies / atama politikalarında profiles alt sorgusu yerine)
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

-- companies politikasında kullanılır (fix-rls-profiles-login-recursion.sql ile aynı gövde)
CREATE OR REPLACE FUNCTION public.auth_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.role = 'ADMIN' FROM public.profiles AS p WHERE p.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.auth_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_admin() TO authenticated;

DROP POLICY IF EXISTS "courses_select_via_assignment" ON public.courses;
DROP POLICY IF EXISTS "courses_select_worker_or_creator" ON public.courses;

CREATE POLICY "courses_select_worker_or_creator"
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.user_worker_sees_course(id)
  );

DROP POLICY IF EXISTS "companies_select_uzman_admin" ON public.companies;

-- ADMIN: tüm şirketler. UZMAN: kendi eklediği veya kendi kursuna atanmış şirketler.
-- (fix-uzman-panel-companies-rls.sql ile aynı; auth_is_admin fix-rls dosyasında olmalı)
CREATE POLICY "companies_select_uzman_admin"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    public.auth_is_admin()
    OR (
      public.auth_is_uzman_or_admin()
      AND NOT public.auth_is_admin()
      AND (
        companies.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.course_assignments AS ca
          INNER JOIN public.courses AS c
            ON c.id = ca.course_id
           AND c.created_by = auth.uid()
          WHERE ca.company_id = companies.id
        )
      )
    )
  );

DROP POLICY IF EXISTS "course_assignments_insert_by_creator" ON public.course_assignments;

CREATE POLICY "course_assignments_insert_by_creator"
  ON public.course_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.course_owned_by_user(course_id, auth.uid())
    AND public.auth_is_uzman_or_admin()
  );

-- Uzman/Admin: kendi oluşturduğu kursların atamalarını görsün (company_id NULL uzmanlar için)
DROP POLICY IF EXISTS "course_assignments_select_for_creator" ON public.course_assignments;

CREATE POLICY "course_assignments_select_for_creator"
  ON public.course_assignments
  FOR SELECT
  TO authenticated
  USING (
    public.course_owned_by_user(course_id, auth.uid())
  );
