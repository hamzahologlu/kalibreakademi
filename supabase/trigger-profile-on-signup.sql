-- Kayıt sonrası profiles — reg_type: worker | uzman (metadata, sunucu tarafından ayarlanır)
-- ADMIN rolü kullanıcı metadata’sından ASLA atanmaz.
--
-- Supabase SQL Editor'da güncellemek için çalıştırın.

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
BEGIN
  fname := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');
  lic := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'isg_license_number', '')), '');
  reg := lower(trim(COALESCE(NEW.raw_user_meta_data->>'reg_type', 'worker')));

  IF reg NOT IN ('worker', 'uzman') THEN
    reg := 'worker';
  END IF;

  -- Uzman: firma zorunlu değil
  IF reg = 'uzman' THEN
    INSERT INTO public.profiles (id, email, full_name, role, company_id, isg_license_number)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      fname,
      'UZMAN',
      NULL,
      lic
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      role = 'UZMAN',
      company_id = NULL,
      isg_license_number = COALESCE(EXCLUDED.isg_license_number, public.profiles.isg_license_number);
    RETURN NEW;
  END IF;

  -- Personel (worker)
  cid := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'company_id', '')), '')::uuid;

  IF cid IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE id = cid) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, company_id, isg_license_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    fname,
    'WORKER',
    cid,
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    company_id = EXCLUDED.company_id,
    role = 'WORKER';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
