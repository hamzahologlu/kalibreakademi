"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/client";
import { MAIN_NAV } from "@/lib/site-config";

type AuthState = "loading" | "in" | "out";

function navLinkClass(active: boolean) {
  return [
    "rounded-full px-3 py-2 text-sm transition sm:px-3.5",
    active
      ? "bg-white/10 font-medium text-white"
      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
  ].join(" ");
}

function MainNav({ pathname }: { pathname: string }) {
  return (
    <>
      {MAIN_NAV.map(({ href, label }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className={navLinkClass(!!active)}>
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
      <div className="flex items-center gap-2" aria-hidden>
        <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-10 w-28 animate-pulse rounded-full bg-white/10" />
      </div>
    );
  }

  if (state === "in") {
    return (
      <>
        <Link
          href="/dashboard"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm text-zinc-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white sm:px-4"
        >
          <LayoutDashboard className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          Panel
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:bg-white/[0.08] sm:px-4"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Çıkış
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <Link
        href="/giris"
        className="inline-flex min-h-10 items-center rounded-full px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white sm:px-4"
      >
        Giriş Yap
      </Link>
      <Link
        href="/kayit"
        className="inline-flex min-h-10 items-center rounded-full bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 sm:px-4"
      >
        Kayıt Ol
      </Link>
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [auth, setAuth] = useState<AuthState>("loading");

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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl backdrop-saturate-150 print:hidden">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex min-h-11 min-w-0 shrink-0 items-center gap-2.5 rounded-lg font-semibold tracking-tight text-white outline-offset-4 transition hover:text-zinc-100"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span className="truncate">Kalibre Akademi</span>
          </Link>

          <nav
            className="hidden flex-1 flex-wrap items-center justify-center gap-1 md:flex"
            aria-label="Site menüsü"
          >
            <MainNav pathname={pathname} />
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <AuthActions state={auth} />
          </div>
        </div>

        <nav
          className="mt-3 flex flex-wrap items-center justify-center gap-1 border-t border-white/5 pt-3 md:hidden"
          aria-label="Site menüsü"
        >
          <MainNav pathname={pathname} />
        </nav>
      </div>
    </header>
  );
}
