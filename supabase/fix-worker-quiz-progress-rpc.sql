-- Personel paneli: sınav sonuçları → "Tamamlandı" rozeti
-- Sertifika sayfası tek course_id ile okuyabiliyorken, panel .in(course_id) veya
-- eksik quiz_results_select_own yüzünden boş dönebiliyor.
--
-- 1) Aşağıdaki RPC (RLS'den bağımsız, yalnızca auth.uid() satırları)
-- 2) fix-rls-profiles-login-recursion.sql güncellemesi: quiz_results_select_own

CREATE OR REPLACE FUNCTION public.get_my_quiz_results_for_courses(p_course_ids uuid[])
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'course_id', qr.course_id,
        'passed', qr.passed,
        'score', qr.score,
        'created_at', qr.created_at
      )
    ),
    '[]'::jsonb
  )
  FROM public.quiz_results qr
  WHERE qr.user_id = auth.uid()
    AND cardinality(p_course_ids) > 0
    AND qr.course_id = ANY(p_course_ids);
$$;

REVOKE ALL ON FUNCTION public.get_my_quiz_results_for_courses(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_quiz_results_for_courses(uuid[]) TO authenticated;
