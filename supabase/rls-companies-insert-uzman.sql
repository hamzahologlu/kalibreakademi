-- Uzman / Admin: companies tablosuna INSERT
-- auth_is_uzman_or_admin(): rls-uzman-rbac.sql veya fix-uzman-panel-companies-rls.sql
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_insert_uzman_admin" ON public.companies;

CREATE POLICY "companies_insert_uzman_admin"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND public.auth_is_uzman_or_admin()
  );
