-- Tek seferlik: eski personel kaydı — profiles + auth ile uyum (personel girişi)
-- Supabase SQL Editor’da çalıştırın.
--
-- Eşleşme: WORKER + tam ad "Hamza Holoğlu"
-- Sentetik e-posta uygulama ile aynı: {TC}@kalibre-worker.invalid
-- Şifre (Auth): telefonun yalnızca rakamları — örnek 05392949082 → 05392949082
--
-- ADIM 1 — profiles (aşağıdaki UPDATE)
-- ADIM 2 — ZORUNLU: Supabase Dashboard → Authentication → Users → ilgili kullanıcı
--   • Email: 50551714155@kalibre-worker.invalid
--   • Password: 05392949082 veya 5392949082 (uygulama girişte ikisini de dener)
--   SQL ile auth şifresi güvenilir biçimde set edilemez; Dashboard veya Admin API kullanın.

UPDATE public.profiles
SET
  tc_kimlik_no = '50551714155',
  phone = regexp_replace('05392949082', '\D', '', 'g'),
  email = '50551714155@kalibre-worker.invalid'
WHERE
  role = 'WORKER'
  AND lower(trim(full_name)) = lower(trim('Hamza Holoğlu'))
RETURNING
  id,
  full_name,
  email,
  tc_kimlik_no,
  phone;

-- Beklenen: 1 satır. 0 satır → isim/rol farklı veya kullanıcı başka tabloda.
-- 2+ satır → aşağıdaki gibi id ile daraltın:
--
-- UPDATE public.profiles
-- SET tc_kimlik_no = '50551714155',
--     phone = regexp_replace('05392949082', '\D', '', 'g'),
--     email = '50551714155@kalibre-worker.invalid'
-- WHERE id = '...uuid...'
-- RETURNING *;
