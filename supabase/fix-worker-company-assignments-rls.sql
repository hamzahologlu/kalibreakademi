-- Personel paneli: şirket adı + atanmış eğitimler
-- Sorun: course_assignments üzerinde yalnızca "kurs sahibi uzman" SELECT politikası kaldıysa
-- personel atama satırlarını hiç göremez; eğitim listesi boşalır.
-- Şirket kartı için companies politikası, profiles alt sorgusunu basitleştirir.
--
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

-- Şirket: personel yalnızca kendi company_id satırını görsün
DROP POLICY IF EXISTS "companies_select_own_worker" ON public.companies;

CREATE POLICY "companies_select_own_worker"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    public.auth_user_company_id() IS NOT NULL
    AND id = public.auth_user_company_id()
  );

-- Atamalar: personel kendi şirketine yapılmış tüm atamaları görsün
-- (uzman politikası course_assignments_select_for_creator ile birlikte kalır; OR ile birleşir)
DROP POLICY IF EXISTS "course_assignments_select_company" ON public.course_assignments;

CREATE POLICY "course_assignments_select_company"
  ON public.course_assignments
  FOR SELECT
  TO authenticated
  USING (
    public.auth_user_company_id() IS NOT NULL
    AND company_id = public.auth_user_company_id()
  );

-- Not: Panelde şirket hâlâ "—" ise profiles.company_id gerçekten NULL olabilir.
-- Table Editor veya:
--   UPDATE public.profiles SET company_id = '<şirket-uuid>'
--   WHERE id = '<kullanıcı-uuid>';
--
-- Şirket adı kartı hâlâ boşsa (eğitimler geliyorsa) companies SELECT politikası
-- uygulanmamış olabilir; uygulama ayrıca fix-worker-company-name-rpc.sql içindeki
-- get_my_company_name() RPC'sini kullanır — onu da çalıştırın.
