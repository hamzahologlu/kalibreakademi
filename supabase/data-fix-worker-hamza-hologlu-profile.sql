-- Tek seferlik: eski personel kaydı — profiles.tc_kimlik_no ve phone doldurma
-- Supabase SQL Editor’da çalıştırın.
--
-- Eşleşme: WORKER + tam ad "Hamza Holoğlu"
-- Telefon: yalnızca rakamlar (kayıt/giriş ile aynı normalizasyon)
--
-- Not: Uygulamadaki TC doğrulama algoritması bu numarayı reddediyorsa kimlikteki
-- rakamları tekrar kontrol edin. Bu script yine de ilettiğiniz değerleri yazar.

UPDATE public.profiles
SET
  tc_kimlik_no = '50551714155',
  phone = regexp_replace('05392949082', '\D', '', 'g')
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
-- SET tc_kimlik_no = '50551714155', phone = regexp_replace('05392949082', '\D', '', 'g')
-- WHERE id = '...uuid...'
-- RETURNING *;
