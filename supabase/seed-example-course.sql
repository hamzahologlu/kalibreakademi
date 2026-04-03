-- Örnek kurs: Sürücü İSG Eğitimi — course + şirket ataması
-- companies tablosunda en az bir satır olmalı.
-- created_by: public.profiles(id) UUID olmalı; örnekte NULL. Uzman atamak için bir profil id yazın.

WITH new_course AS (
  INSERT INTO public.courses (title, video_url, specialist_name, created_by)
  VALUES (
    'Sürücü İSG Eğitimi',
    'https://www.youtube.com/watch?v=Ay0yUT5hi7M',
    'Uzm. Turgut Holoğlu',
    NULL
  )
  RETURNING id
)
INSERT INTO public.course_assignments (course_id, company_id, assigned_at)
SELECT new_course.id, c.id, now()
FROM new_course
CROSS JOIN LATERAL (
  SELECT id
  FROM public.companies
  ORDER BY created_at
  LIMIT 1
) AS c;

-- Belirli davet kodlu şirkete atamak için CROSS JOIN yerine:
-- CROSS JOIN LATERAL (
--   SELECT id FROM public.companies WHERE invite_code = 'DEMO2026' LIMIT 1
-- ) AS c;
