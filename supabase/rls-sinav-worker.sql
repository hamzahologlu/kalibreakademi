-- Personelin atandığı kursun sınavını okuması + quiz_results kaydı
-- Önce migration-quiz-results.sql çalıştırılmış olmalı.
-- Supabase SQL Editor'da bir kez çalıştırın.

-- quizzes: şirkete atanmış personel SELECT (doğru cevaplar da gelir; üretimde ayrı API düşünülebilir)
DROP POLICY IF EXISTS "quizzes_select_assigned_worker" ON public.quizzes;

CREATE POLICY "quizzes_select_assigned_worker"
  ON public.quizzes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.course_assignments AS ca
      INNER JOIN public.profiles AS p
        ON p.id = auth.uid()
       AND p.company_id IS NOT NULL
       AND p.company_id = ca.company_id
      WHERE ca.course_id = quizzes.course_id
    )
  );

-- quiz_results: kendi satırlarını görsün
DROP POLICY IF EXISTS "quiz_results_select_own" ON public.quiz_results;

CREATE POLICY "quiz_results_select_own"
  ON public.quiz_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- quiz_results: yalnızca atandığı kurs için, kendi adına ekleme
DROP POLICY IF EXISTS "quiz_results_insert_assigned" ON public.quiz_results;

CREATE POLICY "quiz_results_insert_assigned"
  ON public.quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.course_assignments AS ca
      INNER JOIN public.profiles AS p
        ON p.id = auth.uid()
       AND p.company_id IS NOT NULL
       AND p.company_id = ca.company_id
      WHERE ca.course_id = quiz_results.course_id
    )
  );
