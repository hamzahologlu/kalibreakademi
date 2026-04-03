-- Personel paneli: şirket adı
-- course_assignments çalışıp companies SELECT boş dönüyorsa (RLS politikası eksik/çakışıyor)
-- bu RPC doğrudan profiles + companies birleştirir; SECURITY DEFINER ile tablo RLS'sini atlar.
--
-- Supabase SQL Editor'da bir kez çalıştırın. Eski küçük SQL dosyalarını silmeniz gerekmez;
-- veritabanında son CREATE POLICY / CREATE FUNCTION kazanır.

CREATE OR REPLACE FUNCTION public.get_my_company_name()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.name::text
  FROM public.profiles AS p
  INNER JOIN public.companies AS c ON c.id = p.company_id
  WHERE p.id = auth.uid()
    AND p.company_id IS NOT NULL
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_my_company_name() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_company_name() TO authenticated;
