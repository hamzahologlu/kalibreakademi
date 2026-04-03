"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, GraduationCap, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase";

function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("invalid login") ||
    m.includes("invalid credentials") ||
    m.includes("email not confirmed")
  ) {
    return "E-posta veya şifre hatalı. Bilgilerinizi kontrol edin.";
  }
  if (m.includes("too many requests")) {
    return "Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.";
  }
  return message || "Giriş yapılamadı.";
}

function GirisBrand() {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/25 sm:h-11 sm:w-11">
        <GraduationCap className="h-7 w-7 sm:h-6 sm:w-6" aria-hidden />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-violet-300/90">
          Kalibre Akademi
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-white sm:text-xl">
          Giriş yap
        </h1>
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      const msg = "E-posta ve şifre gereklidir.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    setPending(true);
    const supabase = createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

    if (authError || !authData.user) {
      const msg = authErrorMessage(authError?.message ?? "");
      setFormError(msg);
      toast.error(msg);
      setPending(false);
      return;
    }

    const { data: roleText, error: profileError } = await supabase.rpc(
      "get_auth_profile_role"
    );

    if (profileError) {
      console.error("[giris] get_auth_profile_role:", profileError);
      const msg =
        profileError.message?.includes("function") &&
        profileError.message?.includes("does not exist")
          ? "Sunucu güncellemesi gerekli: Supabase SQL Editor’da rpc-get-auth-profile-role.sql dosyasını çalıştırın."
          : "Profil bilgisi alınamadı. Lütfen tekrar deneyin.";
      setFormError(msg);
      toast.error(msg);
      setPending(false);
      return;
    }

    if (!roleText || typeof roleText !== "string") {
      const msg =
        "Hesabınız için profil kaydı bulunamadı. Lütfen destek ile iletişime geçin veya yeniden kayıt olun.";
      setFormError(msg);
      toast.error(msg);
      setPending(false);
      return;
    }

    const role = roleText as UserRole;

    if (role === "ADMIN" || role === "UZMAN") {
      toast.success("Giriş başarılı. Uzman paneline yönlendiriliyorsunuz.");
    } else {
      toast.success("Giriş başarılı. Panele yönlendiriliyorsunuz.");
    }

    router.push("/dashboard");
    router.refresh();
    setPending(false);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <GirisBrand />
      <p className="-mt-2 max-w-prose text-sm leading-relaxed text-zinc-400">
        E-posta ve şifrenizle giriş yapın; rolünüze göre doğru panele
        yönlendirileceksiniz.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-5 sm:gap-6"
        noValidate
      >
        {formError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-100"
          >
            {formError}
          </div>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="flex items-center gap-2 text-sm font-medium text-zinc-300"
          >
            <Mail className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
            E-posta
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            disabled={pending}
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="ornek@sirket.com"
            className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="login-password"
            className="flex items-center gap-2 text-sm font-medium text-zinc-300"
          >
            <Lock className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
            Şifre
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            placeholder="••••••••"
            className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled
            title="Yakında eklenecek"
            className="self-start text-sm text-zinc-500 cursor-not-allowed"
          >
            Şifremi unuttum
          </button>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 sm:min-h-11"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="h-4 w-4" aria-hidden />
            )}
            Giriş yap
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Hesabınız yok mu?{" "}
        <Link
          href="/kayit"
          className="font-medium text-violet-400 underline-offset-4 hover:text-violet-300 hover:underline"
        >
          Kayıt ol
        </Link>
      </p>

      <Link
        href="/"
        className="inline-flex min-h-11 items-center justify-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        Ana sayfaya dön
      </Link>
    </div>
  );
}
