"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  HardHat,
  IdCard,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";
import {
  registerUzman,
  registerWorker,
  type RegisterState,
} from "./actions";

const initialState: RegisterState = { error: null };

function useErrorToast(error: string | null) {
  const lastError = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== lastError.current) {
      lastError.current = error;
      toast.error(error);
    }
    if (!error) {
      lastError.current = null;
    }
  }, [error]);
}

function WorkerRegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerWorker,
    initialState
  );
  useErrorToast(state.error);

  return (
    <form
      action={formAction}
      className="flex w-full flex-col gap-5 sm:gap-6"
      noValidate
    >
      <div role="status" aria-live="polite" className="sr-only">
        {state.error ? state.error : ""}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="w_full_name"
          className="flex items-center gap-2 text-sm font-medium text-zinc-300"
        >
          <User className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
          Ad Soyad
        </label>
        <input
          id="w_full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          disabled={isPending}
          placeholder="Adınız Soyadınız"
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="w_tc_kimlik_no"
          className="flex items-center gap-2 text-sm font-medium text-zinc-300"
        >
          <IdCard className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
          T.C. Kimlik No
        </label>
        <input
          id="w_tc_kimlik_no"
          name="tc_kimlik_no"
          type="text"
          autoComplete="off"
          inputMode="numeric"
          pattern="\d*"
          required
          disabled={isPending}
          maxLength={11}
          placeholder="11 hane — girişte kullanıcı adınız bu numara olacak"
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="w_phone"
          className="flex items-center gap-2 text-sm font-medium text-zinc-300"
        >
          <Phone className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
          Telefon No
        </label>
        <input
          id="w_phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          disabled={isPending}
          placeholder="Cep veya sabit — girişte şifreniz bu numaranın rakamları olacak"
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
        />
        <p className="text-xs leading-relaxed text-zinc-500">
          Şifre olarak kayıtta yazdığınız numaranın yalnızca rakamları kullanılır
          (ör. 0532… ile 532… aynıdır). Girişte de aynı numarayı girmeniz yeterlidir.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="w_invite_code"
          className="flex items-center gap-2 text-sm font-medium text-zinc-300"
        >
          <Building2 className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
          Firma kodu
        </label>
        <input
          id="w_invite_code"
          name="invite_code"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          required
          disabled={isPending}
          placeholder="Şirketinizin davet kodu"
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
        />
        <p className="text-xs leading-relaxed text-zinc-500">
          Yöneticinizden aldığınız kodu girin; kayıt sonrası şirketinize
          bağlanırsınız.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 text-base font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:from-violet-500 hover:to-violet-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin sm:h-4 sm:w-4" aria-hidden />
            Kayıt yapılıyor…
          </>
        ) : (
          "Kayıt Ol"
        )}
      </button>
    </form>
  );
}

function UzmanRegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerUzman,
    initialState
  );
  useErrorToast(state.error);

  return (
    <form
      action={formAction}
      className="flex w-full flex-col gap-5 sm:gap-6"
      noValidate
    >
      <div role="status" aria-live="polite" className="sr-only">
        {state.error ? state.error : ""}
      </div>

      <p className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs leading-relaxed text-cyan-100/90">
        İSG Uzmanı kaydı şirket kodu gerektirmez; hesabınız bağımsız oluşturulur.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="u_full_name"
          className="flex items-center gap-2 text-sm font-medium text-zinc-300"
        >
          <User className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
          Ad Soyad
        </label>
        <input
          id="u_full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          disabled={isPending}
          placeholder="Adınız Soyadınız"
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="u_email"
          className="flex items-center gap-2 text-sm font-medium text-zinc-300"
        >
          <Mail className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
          E-posta
        </label>
        <input
          id="u_email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          placeholder="uzman@ornek.com"
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="u_password"
          className="flex items-center gap-2 text-sm font-medium text-zinc-300"
        >
          <Lock className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
          Şifre
        </label>
        <input
          id="u_password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          disabled={isPending}
          placeholder="En az 6 karakter"
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="u_isg_license_number"
          className="flex items-center gap-2 text-sm font-medium text-zinc-300"
        >
          <IdCard className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
          İSG Uzmanlık No
        </label>
        <input
          id="u_isg_license_number"
          name="isg_license_number"
          type="text"
          autoComplete="off"
          required
          disabled={isPending}
          placeholder="Resmî uzmanlık / sicil numaranız"
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 sm:min-h-11 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 text-base font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-cyan-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin sm:h-4 sm:w-4" aria-hidden />
            Kayıt yapılıyor…
          </>
        ) : (
          "Uzman olarak kayıt ol"
        )}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const [tab, setTab] = useState<"worker" | "uzman">("worker");

  return (
    <div className="flex w-full flex-col gap-6">
      <div
        className="flex rounded-xl border border-white/10 bg-zinc-900/50 p-1"
        role="tablist"
        aria-label="Kayıt türü"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "worker"}
          onClick={() => setTab("worker")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition sm:px-4 ${
            tab === "worker"
              ? "bg-violet-600 text-white shadow-md"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Users className="h-4 w-4 shrink-0" aria-hidden />
          Personel Kaydı
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "uzman"}
          onClick={() => setTab("uzman")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition sm:px-4 ${
            tab === "uzman"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <HardHat className="h-4 w-4 shrink-0" aria-hidden />
          İSG Uzmanı Kaydı
        </button>
      </div>

      {tab === "worker" ? <WorkerRegisterForm /> : <UzmanRegisterForm />}

      <p className="text-center text-sm text-zinc-500">
        Zaten hesabınız var mı?{" "}
        <Link
          href="/giris"
          className="font-medium text-violet-400 underline-offset-4 hover:text-violet-300 hover:underline"
        >
          Giriş yapın
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

export function KayitBrand() {
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
          Hesap oluştur
        </h1>
      </div>
    </div>
  );
}
