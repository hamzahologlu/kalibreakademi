-- "infinite recursion detected in policy for relation companies"
-- (İsterseniz bunun yerine güncel fix-uzman-panel-companies-rls.sql tek dosyada çalıştırılabilir.)
-- Nedeni: companies SELECT politikasındaki EXISTS (course_assignments ↔ courses) alt sorgusu,
-- RLS değerlendirmesi sırasında companies ile tekrar kesişebiliyor.
-- INSERT politikasındaki profiles EXISTS de benzer risk taşır.
--
-- Supabase SQL Editor'da bir kez çalıştırın. (auth_is_uzman_or_admin / auth_is_admin
-- fix-uzman-panel-companies-rls.sql ile tanımlı olmalı; yoksa aşağıda yeniden tanımlanır.)

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
    (SELECT p.role = 'ADMIN' FROM public.profiles AS p WHERE p.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.auth_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_admin() TO authenticated;

-- Satır, çağıran kullanıcı için (ADMIN / UZMAN kuralları) görünür mü? Tablo politikasında
-- doğrudan EXISTS kullanmıyoruz; SECURITY DEFINER ile RLS döngüsü oluşmaz.
CREATE OR REPLACE FUNCTION public.company_visible_to_caller(
  p_company_id uuid,
  p_created_by uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.auth_is_admin()
    OR (
      public.auth_is_uzman_or_admin()
      AND NOT public.auth_is_admin()
      AND (
        p_created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.course_assignments AS ca
          INNER JOIN public.courses AS c
            ON c.id = ca.course_id
           AND c.created_by = auth.uid()
          WHERE ca.company_id = p_company_id
        )
      )
    );
$$;

REVOKE ALL ON FUNCTION public.company_visible_to_caller(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.company_visible_to_caller(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "companies_select_uzman_admin" ON public.companies;

CREATE POLICY "companies_select_uzman_admin"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    public.company_visible_to_caller(id, created_by)
  );

-- INSERT: profiles alt sorgusu yerine DEFINER rol fonksiyonu
DROP POLICY IF EXISTS "companies_insert_uzman_admin" ON public.companies;

CREATE POLICY "companies_insert_uzman_admin"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND public.auth_is_uzman_or_admin()
  );

-- UPDATE / DELETE: admin kontrolünde profiles EXISTS kaldır
DROP POLICY IF EXISTS "companies_update_uzman_admin" ON public.companies;

CREATE POLICY "companies_update_uzman_admin"
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.auth_is_admin()
  )
  WITH CHECK (
    created_by = auth.uid()
    OR public.auth_is_admin()
  );

DROP POLICY IF EXISTS "companies_delete_uzman_admin" ON public.companies;

CREATE POLICY "companies_delete_uzman_admin"
  ON public.companies
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.auth_is_admin()
  );
