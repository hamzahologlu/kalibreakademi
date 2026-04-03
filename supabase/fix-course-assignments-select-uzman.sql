-- Uzman panelinde "Atanan şirketler" boş görünüyorsa: mevcut SELECT politikası
-- yalnızca profiles.company_id eşleşen satırları gösteriyor; Uzmanların company_id
-- çoğu zaman NULL olduğu için atama satırları filtreleniyordu.
--
-- course_owned_by_user fonksiyonu (fix-rls-courses-recursion / rls-uzman-rbac) gerekli.
-- Supabase SQL Editor'da çalıştırın.

DROP POLICY IF EXISTS "course_assignments_select_for_creator" ON public.course_assignments;

CREATE POLICY "course_assignments_select_for_creator"
  ON public.course_assignments
  FOR SELECT
  TO authenticated
  USING (
    public.course_owned_by_user(course_id, auth.uid())
  );
