-- course_assignments ↔ courses RLS sonsuz özyinelemesini giderir.
-- "infinite recursion detected in policy for relation course_assignments"
-- Supabase SQL Editor'da bir kez çalıştırın.

-- Politika içinde doğrudan tablo birleşimi yerine SECURITY DEFINER fonksiyonları
-- (RLS atlanır, döngü oluşmaz)

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

-- courses: seçim politikası
DROP POLICY IF EXISTS "courses_select_worker_or_creator" ON public.courses;
DROP POLICY IF EXISTS "courses_select_via_assignment" ON public.courses;

CREATE POLICY "courses_select_worker_or_creator"
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.user_worker_sees_course(id)
  );

-- course_assignments: INSERT (WITH CHECK artık courses RLS tetiklemez)
DROP POLICY IF EXISTS "course_assignments_insert_by_creator" ON public.course_assignments;

CREATE POLICY "course_assignments_insert_by_creator"
  ON public.course_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.course_owned_by_user(course_id, auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.profiles AS p
      WHERE p.id = auth.uid()
        AND p.role IN ('UZMAN', 'ADMIN')
    )
  );
