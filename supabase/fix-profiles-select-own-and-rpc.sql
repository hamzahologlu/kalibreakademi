-- Panel / eğitim / sınav: kendi profil satırının okunması
-- Table Editor veriyi gösterir (service role); tarayıcı istekleri RLS'ye tabidir.
-- profiles_select_own yoksa veya bozuksa company_id ve role uygulamada görünmez.
--
-- 1) Kendi satırını okuma / güncelleme / ilk insert
-- 2) get_my_profile_row() — RLS'den bağımsız güvenli okuma (uygulama bunu kullanır)

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Uygulama (dashboard, eğitim, sınav, server actions) bu RPC ile kendi profilini okur.
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
