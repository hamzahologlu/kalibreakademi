-- Giriş sonrası "Profil bilgisi alınamadı" — profiles politikası içinde profiles'a
-- alt sorgu RLS özyinelemesi yaratıyordu. Bu dosyayı Supabase SQL Editor'da çalıştırın.
-- (rls-uzman-worker-progress.sql sonrası veya onun yerine güncel rls-uzman-worker-progress.sql)

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

DROP POLICY IF EXISTS "profiles_select_workers_managed" ON public.profiles;

CREATE POLICY "profiles_select_workers_managed"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    profiles.role = 'WORKER'
    AND (
      public.auth_is_admin()
      OR EXISTS (
        SELECT 1
        FROM public.course_assignments AS ca
        INNER JOIN public.courses AS c
          ON c.id = ca.course_id
         AND c.created_by = auth.uid()
        WHERE ca.company_id = profiles.company_id
      )
      OR EXISTS (
        SELECT 1
        FROM public.companies AS co
        WHERE co.id = profiles.company_id
          AND co.created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "quiz_results_select_for_course_creator" ON public.quiz_results;

CREATE POLICY "quiz_results_select_for_course_creator"
  ON public.quiz_results
  FOR SELECT
  TO authenticated
  USING (
    public.auth_is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.course_assignments AS ca
      INNER JOIN public.courses AS c
        ON c.id = ca.course_id
       AND c.created_by = auth.uid()
      INNER JOIN public.profiles AS w
        ON w.id = quiz_results.user_id
       AND w.role = 'WORKER'
       AND w.company_id = ca.company_id
      WHERE ca.course_id = quiz_results.course_id
    )
  );

-- Personel: kendi sınav sonuçlarını görsün (panel "Tamamlandı" + doğrudan SELECT)
DROP POLICY IF EXISTS "quiz_results_select_own" ON public.quiz_results;

CREATE POLICY "quiz_results_select_own"
  ON public.quiz_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Giriş formu: doğrudan profiles SELECT yerine RPC (RLS özyinelemesinden etkilenmez)
CREATE OR REPLACE FUNCTION public.get_auth_profile_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role::text
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_auth_profile_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_profile_role() TO authenticated;
