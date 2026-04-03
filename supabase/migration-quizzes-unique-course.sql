-- İsteğe bağlı: Her kurs için en fazla bir quizzes satırı (uygulama zaten böyle kullanıyor).
-- Supabase SQL Editor'da çalıştırın.
-- NOT: Aynı course_id ile birden fazla satır varsa önce mükerrerleri temizleyin; yoksa hata verir.

ALTER TABLE public.quizzes
  ADD CONSTRAINT quizzes_course_id_key UNIQUE (course_id);
