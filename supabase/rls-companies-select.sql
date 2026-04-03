-- Kayıt formunun `companies` tablosunda `invite_code` ile satır bulabilmesi için.
-- `rls-registration.sql` çalıştırıldıysa companies üzerinde RLS açıktır; bu politika olmadan
-- uygulama tarafındaki .from('companies').select(...) anon kullanıcıda sonuç dönmez.
--
-- Güvenlik notu: Bu politika anon ve authenticated rollerinin tüm şirket satırlarını
-- okuyabilmesine izin verir. Daha kısıtlı senaryoda yalnızca `resolve_invite_code` RPC kullanın.

DROP POLICY IF EXISTS "companies_select_for_registration" ON public.companies;

CREATE POLICY "companies_select_for_registration"
  ON public.companies
  FOR SELECT
  TO anon, authenticated
  USING (true);
