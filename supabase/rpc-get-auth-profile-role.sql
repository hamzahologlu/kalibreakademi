-- Giriş sonrası rol okuma: RLS politikalarından bağımsız (SECURITY DEFINER).
-- Supabase SQL Editor'da bir kez çalıştırın.

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
