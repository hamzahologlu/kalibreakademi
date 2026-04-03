import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";

const PATHS = [
  "",
  "/nasil-calisir",
  "/egitimler",
  "/iletisim",
  "/kvkk",
  "/kullanim-sartlari",
  "/cerez-politikasi",
  "/giris",
  "/kayit",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  return PATHS.map((path) => ({
    url: `${base}${path}` || base,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
