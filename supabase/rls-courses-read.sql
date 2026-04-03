-- Kurslar: yalnızca şirketine atanmış kurslar (RLS açılacaksa)
-- course_assignments ve courses için politikalar

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select_same_company" ON public.courses;
DROP POLICY IF EXISTS "courses_select_via_assignment" ON public.courses;

CREATE POLICY "courses_select_via_assignment"
  ON public.courses
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
      WHERE ca.course_id = courses.id
    )
  );

DROP POLICY IF EXISTS "course_assignments_select_company" ON public.course_assignments;

CREATE POLICY "course_assignments_select_company"
  ON public.course_assignments
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT pr.company_id
      FROM public.profiles AS pr
      WHERE pr.id = auth.uid()
        AND pr.company_id IS NOT NULL
    )
  );
