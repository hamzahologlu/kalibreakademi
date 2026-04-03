-- Şirketi ekleyen uzman (ileride filtre için)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies (created_by);
