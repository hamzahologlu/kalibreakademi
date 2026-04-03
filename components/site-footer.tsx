import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { LEGAL_FOOTER_LINKS, MAIN_NAV } from "@/lib/site-config";

const footerLinkClass =
  "text-sm text-zinc-500 transition hover:text-zinc-300";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-zinc-950 print:hidden">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-sm lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                <GraduationCap className="h-4 w-4" aria-hidden />
              </span>
              Kalibre Akademi
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Kurumsal eğitim, sınav ve sertifikasyon için güvenli öğrenme
              platformu.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Menü
            </p>
            <ul className="mt-3 space-y-2">
              {MAIN_NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={footerLinkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Hesap
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/giris" className={footerLinkClass}>
                  Giriş
                </Link>
              </li>
              <li>
                <Link href="/kayit" className={footerLinkClass}>
                  Kayıt
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className={footerLinkClass}>
                  Panel
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Yasal
            </p>
            <ul className="mt-3 space-y-2">
              {LEGAL_FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={footerLinkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Kalibre Akademi. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
