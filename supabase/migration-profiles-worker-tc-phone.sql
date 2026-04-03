-- Personel: T.C. kimlik + telefon (şifre); profiles.tc_kimlik_no, profiles.phone
-- get_my_profile_row + handle_new_user güncellemesi
--
-- ÖNEMLİ: Supabase Dashboard → Authentication → Providers → Email
-- "Confirm email" genelde KAPALI olmalıdır; personelin gerçek e-postası yoktur.
--
-- Supabase SQL Editor'da bir kez çalıştırın.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tc_kimlik_no TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_tc_kimlik_no_unique
  ON public.profiles (tc_kimlik_no)
  WHERE tc_kimlik_no IS NOT NULL;

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
    'tc_kimlik_no', p.tc_kimlik_no,
    'phone', p.phone
  )
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_my_profile_row() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_profile_row() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cid uuid;
  fname text;
  lic text;
  reg text;
  tid text;
  ph text;
BEGIN
  fname := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');
  lic := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'isg_license_number', '')), '');
  reg := lower(trim(COALESCE(NEW.raw_user_meta_data->>'reg_type', 'worker')));
  tid := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'tc_kimlik_no', '')), '');
  ph := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '');

  IF reg NOT IN ('worker', 'uzman') THEN
    reg := 'worker';
  END IF;

  IF reg = 'uzman' THEN
    INSERT INTO public.profiles (
      id, email, full_name, role, company_id, isg_license_number,
      tc_kimlik_no, phone
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      fname,
      'UZMAN',
      NULL,
      lic,
      NULL,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      role = 'UZMAN',
      company_id = NULL,
      isg_license_number = COALESCE(EXCLUDED.isg_license_number, public.profiles.isg_license_number),
      tc_kimlik_no = NULL,
      phone = NULL;
    RETURN NEW;
  END IF;

  cid := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'company_id', '')), '')::uuid;

  IF cid IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE id = cid) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, role, company_id, isg_license_number,
    tc_kimlik_no, phone
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    fname,
    'WORKER',
    cid,
    NULL,
    tid,
    ph
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    company_id = EXCLUDED.company_id,
    role = 'WORKER',
    tc_kimlik_no = COALESCE(EXCLUDED.tc_kimlik_no, public.profiles.tc_kimlik_no),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
