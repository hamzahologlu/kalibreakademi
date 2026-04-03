-- Personel: yalnızca bağlı olduğu şirket satırını görsün (panelde firma adı için).
-- auth_user_company_id: fix-worker-company-assignments-rls.sql ile aynı fonksiyon (CREATE OR REPLACE).
-- Supabase SQL Editor'da bir kez çalıştırın.

CREATE OR REPLACE FUNCTION public.auth_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.auth_user_company_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_company_id() TO authenticated;

DROP POLICY IF EXISTS "companies_select_own_worker" ON public.companies;

CREATE POLICY "companies_select_own_worker"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    public.auth_user_company_id() IS NOT NULL
    AND id = public.auth_user_company_id()
  );
