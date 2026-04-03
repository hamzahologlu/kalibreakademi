-- Uzman / Admin: courses tablosuna INSERT (created_by = auth.uid())
-- Önce courses için RLS açık olmalı (rls-courses-read.sql).

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_insert_uzman_admin" ON public.courses;

CREATE POLICY "courses_insert_uzman_admin"
  ON public.courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles AS p
      WHERE p.id = auth.uid()
        AND p.role IN ('UZMAN', 'ADMIN')
    )
  );
