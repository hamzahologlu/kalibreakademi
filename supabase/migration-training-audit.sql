-- Eğitim denetimi: oturum (giriş/çıkış) kaydı, video süre takibi, sınav cevapları.
-- Önkoşul: user_worker_sees_course, auth_is_admin (rls-uzman-rbac / rls-admin-full-access).
-- Supabase SQL Editor'da bir kez çalıştırın.

-- 1) Platform giriş / çıkış kayıtları
CREATE TABLE IF NOT EXISTS public.auth_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sign_in', 'sign_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_auth_activity_log_user_created
  ON public.auth_activity_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_activity_log_created
  ON public.auth_activity_log (created_at DESC);

ALTER TABLE public.auth_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_activity_log_insert_own" ON public.auth_activity_log;
CREATE POLICY "auth_activity_log_insert_own"
  ON public.auth_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "auth_activity_log_select" ON public.auth_activity_log;
CREATE POLICY "auth_activity_log_select"
  ON public.auth_activity_log
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.auth_is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.profiles AS p
      WHERE p.id = auth_activity_log.user_id
        AND p.role = 'WORKER'
        AND (
          EXISTS (
            SELECT 1
            FROM public.course_assignments AS ca
            INNER JOIN public.courses AS c
              ON c.id = ca.course_id
             AND c.created_by = auth.uid()
            WHERE ca.company_id = p.company_id
          )
          OR EXISTS (
            SELECT 1
            FROM public.companies AS co
            WHERE co.id = p.company_id
              AND co.created_by = auth.uid()
          )
        )
    )
  );

-- 2) Personel eğitim sayfası: oturum açılışı ve izlenen süre (saniye)
CREATE TABLE IF NOT EXISTS public.course_learning_progress (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  total_watch_seconds INTEGER NOT NULL DEFAULT 0,
  session_opens INTEGER NOT NULL DEFAULT 0,
  last_opened_at TIMESTAMPTZ,
  last_heartbeat_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id),
  CONSTRAINT course_learning_watch_non_negative CHECK (total_watch_seconds >= 0),
  CONSTRAINT course_learning_opens_non_negative CHECK (session_opens >= 0)
);

CREATE INDEX IF NOT EXISTS idx_course_learning_course
  ON public.course_learning_progress (course_id);

ALTER TABLE public.course_learning_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "course_learning_progress_select" ON public.course_learning_progress;
CREATE POLICY "course_learning_progress_select"
  ON public.course_learning_progress
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.auth_is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.course_assignments AS ca
      INNER JOIN public.courses AS c
        ON c.id = ca.course_id
       AND c.created_by = auth.uid()
      INNER JOIN public.profiles AS w
        ON w.id = course_learning_progress.user_id
       AND w.role = 'WORKER'
       AND w.company_id = ca.company_id
      WHERE ca.course_id = course_learning_progress.course_id
    )
  );

-- Yazma yalnızca RPC (SECURITY DEFINER) ile
REVOKE INSERT, UPDATE, DELETE ON public.course_learning_progress FROM authenticated;

-- 3) Sınav: seçilen şık indeksleri (0–3) denetim için
ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS answer_indices SMALLINT[];

COMMENT ON COLUMN public.quiz_results.answer_indices IS 'Her soru için seçilen şık (0–3); denetim / yeniden değerlendirme.';

-- 4) RPC: yalnız WORKER, atandığı kurs
CREATE OR REPLACE FUNCTION public.open_course_learning_session(p_course_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = uid AND p.role = 'WORKER'
  ) THEN
    RETURN;
  END IF;
  IF NOT public.user_worker_sees_course(p_course_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.course_learning_progress (
    user_id, course_id, total_watch_seconds, session_opens,
    last_opened_at, last_heartbeat_at, updated_at
  )
  VALUES (uid, p_course_id, 0, 1, now(), now(), now())
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET
    session_opens = course_learning_progress.session_opens + 1,
    last_opened_at = now(),
    last_heartbeat_at = now(),
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.pulse_course_learning(
  p_course_id uuid,
  p_delta_seconds integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  d integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = uid AND p.role = 'WORKER'
  ) THEN
    RETURN;
  END IF;
  IF NOT public.user_worker_sees_course(p_course_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  d := LEAST(GREATEST(COALESCE(p_delta_seconds, 0), 0), 120);

  INSERT INTO public.course_learning_progress (
    user_id, course_id, total_watch_seconds, session_opens,
    last_opened_at, last_heartbeat_at, updated_at
  )
  VALUES (uid, p_course_id, d, 0, now(), now(), now())
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET
    total_watch_seconds = course_learning_progress.total_watch_seconds + d,
    last_heartbeat_at = now(),
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.open_course_learning_session(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pulse_course_learning(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_course_learning_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_course_learning(uuid, integer) TO authenticated;
