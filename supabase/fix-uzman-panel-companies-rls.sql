-- Uzman paneli: Şirketler listesi boş, atanan şirket sütununda UUID, Personel / ilerleme boş
-- Nedeni: companies_select_uzman_admin politikası profiles üzerinde alt sorgu kullanıyor;
-- RLS değerlendirmesinde bu alt sorgu güvenilir çalışmayabiliyor.
--
-- Çözüm: rol kontrolü SECURITY DEFINER fonksiyonla; şirket görünürlüğü:
--   ADMIN → tüm şirketler
--   UZMAN → created_by = kendisi VEYA kendi kursuna atanmış şirket
--
-- Supabase SQL Editor'da bir kez çalıştırın.

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

-- auth_is_admin: fix-rls-profiles-login-recursion.sql ile aynı (yoksa burada da tanımlanır)
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

DROP POLICY IF EXISTS "companies_select_uzman_admin" ON public.companies;

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

-- INSERT politikasındaki profiles alt sorgusunu da güvenilir hale getir
DROP POLICY IF EXISTS "course_assignments_insert_by_creator" ON public.course_assignments;

CREATE POLICY "course_assignments_insert_by_creator"
  ON public.course_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.course_owned_by_user(course_id, auth.uid())
    AND public.auth_is_uzman_or_admin()
  );
