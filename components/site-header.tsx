"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/client";
import { MAIN_NAV } from "@/lib/site-config";

type AuthState = "loading" | "in" | "out";

function navLinkClass(active: boolean, variant: "pill" | "drawer") {
  if (variant === "drawer") {
    return [
      "flex min-h-12 items-center rounded-xl px-4 text-base transition",
      active
        ? "bg-white/10 font-medium text-white"
        : "text-zinc-300 active:bg-white/10 hover:bg-white/5",
    ].join(" ");
  }
  return [
    "rounded-full px-3 py-2 text-sm transition sm:px-3.5",
    active
      ? "bg-white/10 font-medium text-white"
      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
  ].join(" ");
}

function MainNav({
  pathname,
  variant,
  onNavigate,
}: {
  pathname: string;
  variant: "pill" | "drawer";
  onNavigate?: () => void;
}) {
  return (
    <>
      {MAIN_NAV.map(({ href, label }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={navLinkClass(!!active, variant)}
            onClick={onNavigate}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

function AuthActions({ state }: { state: AuthState }) {
  if (state === "loading") {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2" aria-hidden>
        <div className="h-10 w-14 animate-pulse rounded-full bg-white/10 sm:w-24" />
        <div className="h-10 w-16 animate-pulse rounded-full bg-white/10 sm:w-28" />
      </div>
    );
  }

  if (state === "in") {
    return (
      <>
        <Link
          href="/dashboard"
          className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border border-transparent px-2.5 py-2 text-sm text-zinc-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white sm:min-w-0 sm:justify-start sm:px-4"
          aria-label="Panel"
        >
          <LayoutDashboard className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          <span className="hidden sm:inline">Panel</span>
        </Link>
        <form action={signOut} className="inline">
          <button
            type="submit"
            aria-label="Çıkış yap"
            className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:bg-white/[0.08] sm:min-w-0 sm:justify-start sm:px-4"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <Link
        href="/giris"
        className="inline-flex min-h-10 items-center rounded-full px-2.5 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white sm:px-4"
      >
        <span className="hidden max-[380px]:inline">Giriş</span>
        <span className="inline max-[380px]:hidden">Giriş Yap</span>
      </Link>
      <Link
        href="/kayit"
        className="inline-flex min-h-10 items-center rounded-full bg-white px-2.5 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 sm:px-4"
      >
        <span className="hidden max-[380px]:inline">Kayıt</span>
        <span className="inline max-[380px]:hidden">Kayıt Ol</span>
      </Link>
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [auth, setAuth] = useState<AuthState>("loading");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session ? "in" : "out");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session ? "in" : "out");
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl backdrop-saturate-150 print:hidden">
      <div className="mx-auto max-w-6xl px-3 py-2.5 sm:px-6 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:gap-2.5 md:min-w-[12rem] rounded-lg font-semibold tracking-tight text-white outline-offset-4 transition hover:text-zinc-100"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 truncate text-[0.9375rem] sm:text-base">
              <span className="sm:hidden">Kalibre</span>
              <span className="hidden sm:inline">Kalibre Akademi</span>
            </span>
          </Link>

          <nav
            className="hidden flex-1 flex-wrap items-center justify-center gap-1 md:flex"
            aria-label="Site menüsü"
          >
            <MainNav pathname={pathname} variant="pill" />
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <AuthActions state={auth} />
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="site-mobile-nav"
              aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[100] md:hidden" id="site-mobile-nav">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="Menüyü kapat"
            onClick={closeMobile}
          />
          <div
            className="absolute right-0 top-0 flex h-[100dvh] w-[min(100vw,20rem)] flex-col border-l border-white/10 bg-zinc-950/98 shadow-2xl shadow-black/40"
            style={{
              paddingTop: "max(env(safe-area-inset-top, 0px), 0.75rem)",
              paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1rem)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Menü
              </p>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Menüyü kapat"
                onClick={closeMobile}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav
              className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
              aria-label="Site menüsü"
            >
              <MainNav
                pathname={pathname}
                variant="drawer"
                onNavigate={closeMobile}
              />
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
