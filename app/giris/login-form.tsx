"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  GraduationCap,
  HardHat,
  IdCard,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import {
  isPlausibleWorkerLoginTc,
  normalizePhoneDigits,
  normalizeTcKimlikNo,
  workerSyntheticEmail,
} from "@/lib/auth-worker";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase";

function authErrorMessageUzman(message: string): string {
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

function authErrorMessagePersonel(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("invalid login") ||
    m.includes("invalid credentials") ||
    m.includes("email not confirmed")
  ) {
    return "T.C. Kimlik Numarası veya telefon (şifre) hatalı. Kayıttaki bilgilerle aynı olduğundan emin olun.";
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
  const [tab, setTab] = useState<"personel" | "uzman">("personel");
  const [workerTc, setWorkerTc] = useState("");
  const [workerPhone, setWorkerPhone] = useState("");
  const [uzmanEmail, setUzmanEmail] = useState("");
  const [uzmanPassword, setUzmanPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    let email: string;
    let password: string;

    if (tab === "personel") {
      const tcDigits = normalizeTcKimlikNo(workerTc);
      if (!isPlausibleWorkerLoginTc(tcDigits)) {
        const msg =
          "11 haneli T.C. Kimlik Numaranızı girin (yalnızca rakam, ilk rakam 0 olamaz).";
        setFormError(msg);
        toast.error(msg);
        return;
      }
      const phoneDigits = normalizePhoneDigits(workerPhone);
      if (phoneDigits.length < 10) {
        const msg = "Telefon numaranızı girin (en az 10 hane, kayıtta kullandığınız numara).";
        setFormError(msg);
        toast.error(msg);
        return;
      }
      email = workerSyntheticEmail(tcDigits);
      password = phoneDigits;
    } else {
      const trimmedEmail = uzmanEmail.trim();
      if (!trimmedEmail || !uzmanPassword) {
        const msg = "E-posta ve şifre gereklidir.";
        setFormError(msg);
        toast.error(msg);
        return;
      }
      email = trimmedEmail;
      password = uzmanPassword;
    }

    setPending(true);
    const supabase = createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      const raw = authError?.message ?? "";
      const msg =
        tab === "personel"
          ? authErrorMessagePersonel(raw)
          : authErrorMessageUzman(raw);
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

    if (tab === "personel" && role !== "WORKER") {
      const msg =
        "Bu giriş yolu yalnızca personel hesapları içindir. İSG uzmanıysanız «İSG Uzmanı» sekmesini kullanın.";
      setFormError(msg);
      toast.error(msg);
      await supabase.auth.signOut();
      setPending(false);
      return;
    }

    if (tab === "uzman" && role === "WORKER") {
      const msg =
        "Personel hesabınız var. Giriş için «Personel» sekmesinde T.C. kimlik ve telefon kullanın.";
      setFormError(msg);
      toast.error(msg);
      await supabase.auth.signOut();
      setPending(false);
      return;
    }

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

      <div
        className="flex rounded-xl border border-white/10 bg-zinc-900/50 p-1"
        role="tablist"
        aria-label="Giriş türü"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "personel"}
          onClick={() => {
            setTab("personel");
            setFormError(null);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition sm:px-4 ${
            tab === "personel"
              ? "bg-violet-600 text-white shadow-md"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Users className="h-4 w-4 shrink-0" aria-hidden />
          Personel
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "uzman"}
          onClick={() => {
            setTab("uzman");
            setFormError(null);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition sm:px-4 ${
            tab === "uzman"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <HardHat className="h-4 w-4 shrink-0" aria-hidden />
          İSG Uzmanı
        </button>
      </div>

      {tab === "personel" ? (
        <p className="-mt-2 max-w-prose text-sm leading-relaxed text-zinc-400">
          <strong className="font-medium text-zinc-300">Kullanıcı adı</strong>{" "}
          T.C. Kimlik Numaranız, <strong className="font-medium text-zinc-300">şifre</strong> ise
          kayıt olurken yazdığınız telefon numarasının rakamlarıdır. E-posta gerekmez.
        </p>
      ) : (
        <p className="-mt-2 max-w-prose text-sm leading-relaxed text-zinc-400">
          İSG uzmanı ve yönetici hesapları e-posta ve şifre ile giriş yapar.
        </p>
      )}

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

        {tab === "personel" ? (
          <>
            <div className="space-y-2">
              <label
                htmlFor="login-worker-tc"
                className="flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <IdCard className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
                Kullanıcı adı (T.C. Kimlik No)
              </label>
              <input
                id="login-worker-tc"
                name="tc_kimlik_no"
                type="text"
                autoComplete="username"
                inputMode="numeric"
                pattern="\d*"
                maxLength={11}
                required
                disabled={pending}
                value={workerTc}
                onChange={(ev) => setWorkerTc(ev.target.value)}
                placeholder="T.C. Kimlik Numaranız (11 hane)"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-worker-phone"
                className="flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <Phone className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
                Şifre (telefon numaranız)
              </label>
              <input
                id="login-worker-phone"
                name="phone_password"
                type="password"
                autoComplete="current-password"
                inputMode="tel"
                required
                disabled={pending}
                value={workerPhone}
                onChange={(ev) => setWorkerPhone(ev.target.value)}
                placeholder="Kayıtta yazdığınız telefon — sadece rakamlar şifrenizdir"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <Mail className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
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
                value={uzmanEmail}
                onChange={(ev) => setUzmanEmail(ev.target.value)}
                placeholder="ornek@sirket.com"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <Lock className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
                Şifre
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={pending}
                value={uzmanPassword}
                onChange={(ev) => setUzmanPassword(ev.target.value)}
                placeholder="Hesap şifreniz"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-3">
          {tab === "uzman" ? (
            <button
              type="button"
              disabled
              title="Yakında eklenecek"
              className="self-start cursor-not-allowed text-sm text-zinc-500"
            >
              Şifremi unuttum
            </button>
          ) : (
            <p className="text-xs leading-relaxed text-zinc-500">
              Şifreniz kayıttaki telefon numaranızdır; unutursanız aynı numarayı tekrar
              girin veya yöneticinizden yardım isteyin.
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-lg transition disabled:opacity-50 sm:min-h-11 ${
              tab === "personel"
                ? "bg-gradient-to-r from-violet-600 to-violet-500 shadow-violet-900/30 hover:from-violet-500 hover:to-violet-400"
                : "bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-cyan-900/30 hover:from-cyan-500 hover:to-cyan-400"
            }`}
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
