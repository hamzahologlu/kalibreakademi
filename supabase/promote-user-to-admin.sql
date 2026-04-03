-- Hesabı ADMIN yapmak için (Supabase SQL Editor).
--
-- ÖNERİLEN: Aşağıdaki e-posta adresini, yönetici olacak hesabın
-- Authentication → Users veya profiles.email adresi ile değiştirin ve çalıştırın.
-- Eşleşen satır yoksa hata almazsınız; RETURNING boş döner (adresi kontrol edin).

UPDATE public.profiles
SET role = 'ADMIN'
WHERE lower(trim(email)) = lower(trim('yoneticinin-epostasi@ornek.com'))
RETURNING id, email, full_name, role;

-- UUID ile (yalnızca gerçek kimlik: 0-9 ve a-f; "xxxxx..." placeholder HATA verir):
--
-- UPDATE public.profiles
-- SET role = 'ADMIN'
-- WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid
-- RETURNING id, email, full_name, role;
