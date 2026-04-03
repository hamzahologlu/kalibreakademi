import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookMarked,
  Building2,
  ClipboardList,
  KeyRound,
  LayoutDashboard,
  LogIn,
  PlayCircle,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Nasıl Çalışır",
  description:
    "Kalibre Akademi ile şirket kodu, uzman paneli, eğitim atama ve sınav süreçleri nasıl işler?",
  path: "/nasil-calisir",
});

const PERSONEL = [
  {
    icon: KeyRound,
    title: "Davet kodu ile kayıt",
    body: "Kayıt sırasında şirketinizin davet kodunu girerek doğru şirket alanına bağlanırsınız.",
  },
  {
    icon: LayoutDashboard,
    title: "Panel ve atamalar",
    body: "Giriş yaptıktan sonra size atanmış eğitimleri tek ekranda görüntüleyin.",
  },
  {
    icon: PlayCircle,
    title: "İzle ve sınava gir",
    body: "Video eğitimi tamamlayın; ardından bilgiyi ölçen sınavı çözün.",
  },
  {
    icon: Award,
    title: "Sertifika",
    body: "Barajı geçtiğinizde sertifikanıza güvenli şekilde erişebilirsiniz.",
  },
] as const;

const UZMAN = [
  {
    icon: LogIn,
    title: "Uzman hesabı",
    body: "İSG uzmanı rolüyle giriş yapın; içerik ve şirket yönetimine erişin.",
  },
  {
    icon: BookMarked,
    title: "Eğitim içeriği",
    body: "Kursları oluşturun, videoları ve uzman bilgisini güncel tutun.",
  },
  {
    icon: Building2,
    title: "Şirket ve atama",
    body: "Şirket kaydı açın; eğitimleri ilgili şirketlere atayın.",
  },
  {
    icon: ClipboardList,
    title: "Sınav ve takip",
    body: "Sınavları tanımlayın; personel ilerlemesini panelden izleyin.",
  },
] as const;

export default function NasilCalisirPage() {
  return (
    <div className="relative overflow-hidden bg-zinc-950 text-zinc-50">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.35),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 right-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-1/4 left-0 h-80 w-80 rounded-full bg-cyan-500/12 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-12 sm:px-8 sm:pt-16">
        {/* Hero */}
        <header className="text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-violet-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            Süreç rehberi
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Nasıl Çalışır?
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Personel ve İSG uzmanı rolleri için platform akışı; kayıttan sertifikaya
            veya içerik yönetimine kadar net adımlar.
          </p>
        </header>

        {/* İki sütun: Personel | Uzman */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-8 xl:gap-12">
          {/* Personel kolonu */}
          <section
            aria-labelledby="nasil-personel"
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-8"
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 text-white">
                <UserCircle2 className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                  Rol
                </p>
                <h2
                  id="nasil-personel"
                  className="text-xl font-semibold text-white sm:text-2xl"
                >
                  Personel
                </h2>
              </div>
            </div>
            <ol className="mt-8 space-y-4">
              {PERSONEL.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <li key={step.title}>
                    <div className="flex gap-4 rounded-2xl border border-white/5 bg-zinc-950/40 p-4 transition hover:border-white/10">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-200">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-cyan-400/90">
                          <StepIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </span>
                        <h3 className="font-semibold text-white">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Uzman kolonu */}
          <section
            aria-labelledby="nasil-uzman"
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-8"
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 to-violet-600/25 text-white">
                <ClipboardList className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">
                  Rol
                </p>
                <h2
                  id="nasil-uzman"
                  className="text-xl font-semibold text-white sm:text-2xl"
                >
                  İSG uzmanı
                </h2>
              </div>
            </div>
            <ol className="mt-8 space-y-4">
              {UZMAN.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <li key={step.title}>
                    <div className="flex gap-4 rounded-2xl border border-white/5 bg-zinc-950/40 p-4 transition hover:border-white/10">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-200">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-amber-300/90">
                          <StepIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </span>
                        <h3 className="font-semibold text-white">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16">
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/[0.15] via-zinc-950/80 to-zinc-950 px-8 py-12 text-center sm:px-10 sm:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl"
            />
            <div className="relative">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Hemen başlayın
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400 sm:text-base">
                Şirket kodunuz veya uzman kaydınızla platforma katılın.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/kayit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100"
                >
                  Kayıt Ol
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/giris"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center text-sm font-medium text-zinc-400 transition hover:text-white sm:ml-2"
                >
                  ← Ana sayfa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
