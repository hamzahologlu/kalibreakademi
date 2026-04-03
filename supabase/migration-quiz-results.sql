-- Personel sınav sonuçları (Supabase SQL Editor)

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes (id) ON DELETE SET NULL,
  score NUMERIC(5, 2) NOT NULL,
  passed BOOLEAN NOT NULL,
  correct_count INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_course_id ON public.quiz_results (course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_course ON public.quiz_results (user_id, course_id);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
