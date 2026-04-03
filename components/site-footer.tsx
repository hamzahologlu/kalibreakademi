import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { LEGAL_FOOTER_LINKS, MAIN_NAV } from "@/lib/site-config";

const footerLinkClass =
  "-mx-1 block rounded-lg px-1 py-2.5 text-sm leading-snug text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300 active:bg-white/[0.06] sm:py-2";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-zinc-950 pb-[env(safe-area-inset-bottom,0px)] print:hidden">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-10">
          <div className="max-w-sm border-b border-white/5 pb-8 sm:col-span-2 sm:border-b-0 sm:pb-0 lg:col-span-1 lg:max-w-none">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg font-semibold text-white outline-offset-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                <GraduationCap className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-[0.9375rem] sm:text-base">Kalibre Akademi</span>
            </Link>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-500">
              Kurumsal eğitim, sınav ve sertifikasyon için güvenli öğrenme
              platformu.
            </p>
          </div>
          <div className="min-w-0 sm:border-b-0 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Menü
            </p>
            <ul className="mt-2 sm:mt-3">
              {MAIN_NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={footerLinkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Hesap
            </p>
            <ul className="mt-2 sm:mt-3">
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
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Yasal
            </p>
            <ul className="mt-2 sm:mt-3">
              {LEGAL_FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`${footerLinkClass} break-words`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-white/5 pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <p className="text-center text-xs text-zinc-600 sm:text-left">
            © {new Date().getFullYear()} Kalibre Akademi. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
