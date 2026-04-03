-- Hesabı ADMIN yapmak için (Supabase SQL Editor).
-- Aşağıdaki UUID değerini Authentication → Users → ilgili kullanıcının id’si ile değiştirin.
-- (profiles.id = auth.users.id)

UPDATE public.profiles
SET role = 'ADMIN'
WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid
RETURNING id, email, full_name, role;

-- E-posta ile örnek:
-- UPDATE public.profiles
-- SET role = 'ADMIN'
-- WHERE lower(trim(email)) = lower(trim('yonetici@ornek.com'))
-- RETURNING id, email, full_name, role;
