-- get_my_profile_row JSON'a isg_license_number ekler (panel İSG kutusu için).
-- fix-profiles-select-own-and-rpc.sql güncelse bu dosyayı çalıştırmanız gerekmez.
-- Supabase SQL Editor'da bir kez.

CREATE OR REPLACE FUNCTION public.get_my_profile_row()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'email', p.email,
    'role', p.role::text,
    'company_id', p.company_id,
    'isg_license_number', p.isg_license_number,
    'tc_kimlik_no', p.tc_kimlik_no,
    'phone', p.phone
  )
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_my_profile_row() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_profile_row() TO authenticated;
