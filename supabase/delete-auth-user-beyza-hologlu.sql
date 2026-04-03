-- Beyza Holoğlu Auth hesabını tamamen kaldır (Supabase SQL Editor)
--
-- auth.users silinince CASCADE ile public.profiles ve quiz_results temizlenir
-- (profiles / quiz_results auth.users’a CASCADE bağlıysa).
--
-- Önce id’yi Dashboard’da doğrulayın (Authentication → Users).

-- Önizleme (isteğe bağlı):
-- SELECT id, email, raw_user_meta_data->>'full_name' AS display_name
-- FROM auth.users
-- WHERE id = 'a345b4e6-2cab-4d89-8727-e4f40d292aad'::uuid;

DELETE FROM auth.users
WHERE id = 'a345b4e6-2cab-4d89-8727-e4f40d292aad'::uuid
RETURNING id, email;
