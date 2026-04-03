-- profiles: İSG Uzmanlık numarası (sadece UZMAN kayıtlarında dolu olabilir)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS isg_license_number TEXT;
