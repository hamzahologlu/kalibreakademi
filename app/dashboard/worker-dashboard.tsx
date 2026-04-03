import Link from "next/link";
import type { ReactNode } from "react";
import {
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Play,
  Sparkles,
  User,
} from "lucide-react";
import type { CourseRow } from "@/lib/supabase";

export type WorkerCourseItem = Pick<
  CourseRow,
  "id" | "title" | "specialist_name" | "video_url"
> & {
  hasQuiz: boolean;
  progress:
    | { status: "none" }
    | { status: "completed"; bestScore: number }
    | { status: "failed"; lastScore: number };
};

type ProfileSlice = {
  full_name: string | null;
  email: string | null;
  role: string | null;
  company_id: string | null;
  tc_kimlik_no: string | null;
  phone: string | null;
};

type Props = {
  profile: ProfileSlice | null;
  /** profiles.company_id ile eşleşen şirket adı */
  companyName: string | null;
  courses: WorkerCourseItem[];
  kayitBasarili: boolean;
};

function WorkerAlert({
  variant,
  children,
}: {
  variant: "amber";
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-8 text-left text-sm leading-relaxed text-amber-100/90">
      {children}
    </div>
  );
}

function roleLabelForWorker(role: string | null | undefined): string {
  if (role == null || role === "") return "Personel";
  if (role.toUpperCase() === "WORKER") return "Personel";
  return role;
}

export function WorkerDashboard({
  profile,
  companyName,
  courses,
  kayitBasarili,
}: Props) {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {kayitBasarili ? (
          <div
            role="status"
            className="relative mb-10 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-5 sm:p-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl"
            />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="h-7 w-7" aria-hidden />
              </span>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                  <Sparkles className="h-4 w-4 text-amber-300/90" aria-hidden />
                  Aramıza hoş geldiniz
                </p>
                <p className="mt-1 text-sm leading-relaxed text-emerald-100/90">
                  Kayıt işleminiz tamamlandı. Aşağıda profil bilgilerinizi ve
                  şirketinize atanmış eğitimleri görebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <section>
          <p className="text-sm font-medium text-violet-300/90">Panel</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Hoş geldiniz
            {profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="mt-2 max-w-prose text-zinc-400">
            Eğitim içeriklerinize buradan erişebilirsiniz.
          </p>
        </section>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              T.C. Kimlik No
            </dt>
            <dd className="mt-1 font-mono text-sm text-zinc-200">
              {profile?.tc_kimlik_no ?? "—"}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Telefon
            </dt>
            <dd className="mt-1 font-mono text-sm text-zinc-200">
              {profile?.phone ?? "—"}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Rol
            </dt>
            <dd className="mt-1 text-sm text-zinc-200">
              {roleLabelForWorker(profile?.role)}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <Building2 className="h-3.5 w-3.5 text-cyan-400/80" aria-hidden />
              Şirket
            </dt>
            <dd className="mt-2 text-sm font-medium text-zinc-100">
              {companyName ?? "—"}
            </dd>
          </div>
        </dl>

        <section className="mt-12 border-t border-white/10 pt-10">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <BookOpen
                className="h-5 w-5 text-violet-400"
                strokeWidth={1.75}
                aria-hidden
              />
              Eğitimleriniz
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Şirketinize tanımlı video eğitimler
            </p>
          </div>

          {!profile?.company_id ? (
            <WorkerAlert variant="amber">
              <p>
                Profilinizde şirket bağlantısı yok (
                <code className="rounded bg-black/30 px-1 font-mono text-xs">
                  company_id
                </code>
                ). Kayıtta doğru şirket davet kodunu kullandığınızdan emin
                olun. Veritabanında alan boşsa İSG uzmanınız veya yönetici
                Supabase&apos;de bu kullanıcının{" "}
                <code className="rounded bg-black/30 px-1 font-mono text-xs">
                  profiles.company_id
                </code>{" "}
                değerini ilgili şirketin UUID&apos;si ile güncellemelidir.
              </p>
            </WorkerAlert>
          ) : (
            <>
              {companyName == null ? (
                <WorkerAlert variant="amber">
                  <p>
                    Şirket adı yüklenemedi. Supabase SQL Editor&apos;da{" "}
                    <code className="rounded bg-black/30 px-1 font-mono text-xs">
                      fix-worker-company-name-rpc.sql
                    </code>{" "}
                    (veya{" "}
                    <code className="rounded bg-black/30 px-1 font-mono text-xs">
                      fix-worker-company-assignments-rls.sql
                    </code>
                    içindeki şirket SELECT politikası) çalıştırıp sayfayı yenileyin.
                    Eğitim listesi aşağıda yine de görünebilir.
                  </p>
                </WorkerAlert>
              ) : null}
              {courses.length === 0 ? (
                <div
                  className={`rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center ${companyName == null ? "mt-4" : ""}`}
                >
                  <p className="text-sm text-zinc-400">
                    Henüz size atanmış bir eğitim bulunmuyor.
                  </p>
                </div>
              ) : (
            <ul className={`grid gap-4 sm:grid-cols-2 ${companyName == null ? "mt-4" : ""}`}>
              {courses.map((course) => {
                const done = course.progress.status === "completed";
                const failed = course.progress.status === "failed";

                return (
                  <li key={course.id}>
                    <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-lg shadow-black/20 transition hover:border-violet-500/25 hover:from-white/[0.08]">
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="text-base font-semibold leading-snug text-white">
                            {course.title}
                          </h3>
                          {done ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-200">
                              <CheckCircle2
                                className="h-3.5 w-3.5"
                                aria-hidden
                              />
                              Tamamlandı
                            </span>
                          ) : failed ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-100">
                              Baraj altı
                            </span>
                          ) : null}
                        </div>
                        <p className="flex items-center gap-2 text-sm text-zinc-500">
                          <User
                            className="h-4 w-4 shrink-0 text-violet-400/90"
                            aria-hidden
                          />
                          <span className="text-zinc-400">
                            {course.specialist_name ?? "Uzman"}
                          </span>
                        </p>
                        {course.progress.status === "completed" ? (
                          <p className="text-xs text-zinc-500">
                            Puan:{" "}
                            <span className="font-medium text-zinc-300">
                              {course.progress.bestScore}
                            </span>{" "}
                            / 100
                          </p>
                        ) : course.progress.status === "failed" ? (
                          <p className="text-xs text-zinc-500">
                            Son deneme:{" "}
                            <span className="font-medium text-zinc-400">
                              {course.progress.lastScore}
                            </span>{" "}
                            / 100
                          </p>
                        ) : course.hasQuiz ? (
                          <p className="text-xs text-zinc-600">
                            Sınavı tamamlayınca burada tamamlandı olarak
                            görünür.
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-5 flex flex-col gap-2">
                        {done ? (
                          <>
                            <Link
                              href={`/sertifika/${course.id}`}
                              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 text-sm font-semibold text-zinc-950 shadow-md"
                            >
                              <Award className="h-4 w-4 shrink-0" aria-hidden />
                              Sertifikayı görüntüle
                            </Link>
                            <Link
                              href={`/egitim/${course.id}`}
                              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                            >
                              <Play className="h-4 w-4 shrink-0" aria-hidden />
                              Eğitimi yeniden izle
                            </Link>
                          </>
                        ) : failed && course.hasQuiz ? (
                          <>
                            <Link
                              href={`/sinav/${course.id}`}
                              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 text-sm font-semibold text-white shadow-md shadow-cyan-950/30"
                            >
                              <ClipboardCheck
                                className="h-4 w-4 shrink-0"
                                aria-hidden
                              />
                              Sınava tekrar gir
                            </Link>
                            <Link
                              href={`/egitim/${course.id}`}
                              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/12 px-4 text-sm text-zinc-300 hover:bg-white/5"
                            >
                              <Play className="h-4 w-4 shrink-0" aria-hidden />
                              Videoyu tekrar izle
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={`/egitim/${course.id}`}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 text-sm font-semibold text-white shadow-md shadow-violet-900/30 transition group-hover:from-violet-500 group-hover:to-violet-400"
                          >
                            <Play className="h-4 w-4 shrink-0" aria-hidden />
                            {course.hasQuiz
                              ? "Eğitime git"
                              : "Eğitimi izle"}
                          </Link>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
