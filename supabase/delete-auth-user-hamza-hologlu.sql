-- Hamza Holoğlu Auth hesabını tamamen kaldır (Supabase SQL Editor)
--
-- Ne olur: auth.users satırı silinince (şema CASCADE ise) public.profiles ve
-- public.quiz_results içindeki bu kullanıcıya bağlı kayıtlar da silinir.
-- courses / companies üzerinde created_by bu profile işaret ediyorsa SET NULL olur.
--
-- Önce RETURNING ile doğrulayın; yanlış kullanıcıysa DELETE çalıştırmayın.

-- Önizleme (isteğe bağlı):
-- SELECT id, email, raw_user_meta_data->>'full_name' AS display_name
-- FROM auth.users
-- WHERE id = '465a511f-affa-4561-a885-b1d4953bb425'::uuid;

DELETE FROM auth.users
WHERE id = '465a511f-affa-4561-a885-b1d4953bb425'::uuid
RETURNING id, email;

-- Not: SQL çalıştırmak istemezseniz Dashboard → Authentication → Users →
-- kullanıcı menüsünden "Delete user" aynı işlevi görür.
