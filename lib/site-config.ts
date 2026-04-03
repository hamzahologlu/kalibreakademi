export const SITE_NAME = "Kalibre Akademi";

/** İletişim sayfasında gösterilir; kendi alan adınıza göre güncelleyin. */
export const CONTACT_EMAIL = "info@kalibreakademi.com";

export const SITE_DESCRIPTION =
  "Kurumsal eğitim platformu — video kurslar, sınavlar, sertifika ve şirket bazlı öğrenme.";

export const MAIN_NAV = [
  { href: "/", label: "Anasayfa" },
  { href: "/nasil-calisir", label: "Nasıl Çalışır" },
  { href: "/egitimler", label: "Eğitimler" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export const LEGAL_FOOTER_LINKS = [
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
] as const;

/** Üretimde `NEXT_PUBLIC_SITE_URL=https://alanadiniz.com` tanımlayın. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
