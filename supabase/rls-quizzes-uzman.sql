-- quizzes: kurs sahibi uzman / admin okuma ve yazma
-- Supabase SQL Editor'da bir kez çalıştırın.

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quizzes_select_course_creator" ON public.quizzes;
CREATE POLICY "quizzes_select_course_creator"
  ON public.quizzes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses AS c
      WHERE c.id = quizzes.course_id
        AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "quizzes_insert_course_creator" ON public.quizzes;
CREATE POLICY "quizzes_insert_course_creator"
  ON public.quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses AS c
      WHERE c.id = quizzes.course_id
        AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "quizzes_update_course_creator" ON public.quizzes;
CREATE POLICY "quizzes_update_course_creator"
  ON public.quizzes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses AS c
      WHERE c.id = quizzes.course_id
        AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses AS c
      WHERE c.id = quizzes.course_id
        AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );
