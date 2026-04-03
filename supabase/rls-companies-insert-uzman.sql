-- Uzman / Admin: companies tablosuna INSERT
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_insert_uzman_admin" ON public.companies;

CREATE POLICY "companies_insert_uzman_admin"
  ON public.companies
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
