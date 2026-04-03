-- Kayıt akışı için Supabase SQL Editor'da çalıştırın (schema.sql sonrası).
-- 1) Firma kodunu güvenli şekilde çözümleyen RPC (tabloyu listelemeden)
-- 2) profiles için RLS politikaları

CREATE OR REPLACE FUNCTION public.resolve_invite_code(invite text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.companies
  WHERE invite_code = trim(both from invite)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_invite_code(text) TO anon;
GRANT EXECUTE ON FUNCTION public.resolve_invite_code(text) TO authenticated;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- İsterseniz yönetici için companies okuma politikası ekleyin; kayıt RPC ile çalışır.

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

-- Öneri: Authentication > Providers > "Confirm email" kapalıyken anında oturum açılır
-- ve uygulama profil satırını ekleyebilir. Açıksa oturum gelmez; o zaman tetikleyici
-- veya e-posta onayı sonrası tamamlama gerekir.
