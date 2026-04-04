"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Award,
  BarChart3,
  BookMarked,
  Building2,
  ClipboardList,
  Clock,
  Eye,
  FileDown,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Mail,
  Pencil,
  Play,
  Search,
  Shield,
  Sparkles,
  Trash2,
  User,
  UserCircle2,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { CompanyRow, CourseRow, QuizRow, UserRole } from "@/lib/supabase";
import {
  downloadPersonelExcel,
  downloadSirketlerExcel,
} from "@/lib/excel-export";
import { AddCompanyModal } from "./add-company-modal";
import { AddCourseModal } from "./add-course-modal";
import { AssignCompanyModal } from "./assign-company-modal";
import { CourseAssignmentTag } from "./course-assignment-tag";
import { deleteCompany } from "./company-mutations";
import { deleteCourse } from "./course-mutations";
import { DestructiveConfirmDialog } from "./destructive-confirm-dialog";
import { EditCompanyModal } from "./edit-company-modal";
import { EditCourseModal } from "./edit-course-modal";
import { ManageQuizModal } from "./manage-quiz-modal";
import { PreviewQuizModal } from "./preview-quiz-modal";

type ProfileSlice = {
  full_name: string | null;
  email: string | null;
  role: string | null;
  isg_license_number?: string | null;
};

type AssignmentRow = {
  course_id: string;
  company_id: string;
};

export type UzmanWorkerRow = {
  id: string;
  email: string;
  full_name: string | null;
  company_id: string;
  tc_kimlik_no: string | null;
  phone: string | null;
};

export type SpecialistSummaryRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  isg_license_number: string | null;
};

export type AdminCertificateSummaryRow = {
  resultId: string;
  userId: string;
  personName: string;
  courseTitle: string;
  score: number;
  issuedAt: string;
  certLabel: string;
};

export type UzmanProgressRow = {
  key: string;
  workerId: string;
  courseId: string;
  workerName: string;
  workerEmail: string;
  companyName: string;
  courseTitle: string;
  status: "no_quiz" | "pending" | "failed" | "passed";
  scoreText: string | null;
  passingScore: number | null;
  /** Denetim: eğitim sayfası süresi (migration sonrası) */
  watchMinutes?: number;
  sessionOpens?: number;
  lastVideoAt?: string | null;
  /** Sınav geçtiyse 100; değilse ~video süresi / 45 dk */
  completionEstimatePct?: number | null;
};

export type AuthSessionDisplayRow = {
  id: string;
  workerName: string;
  eventLabel: string;
  createdAt: string;
  userAgentShort: string | null;
};

type Props = {
  profile: ProfileSlice | null;
  userId: string;
  userRole: UserRole;
  userEmail: string | null;
  myCourses: CourseRow[];
  companies: CompanyRow[];
  assignments: AssignmentRow[];
  quizzesByCourseId: Record<string, QuizRow>;
  workers: UzmanWorkerRow[];
  progressRows: UzmanProgressRow[];
  /** Personel giriş/çıkış kayıtları (migration-training-audit.sql) */
  authActivityLog?: AuthSessionDisplayRow[];
  /** Yalnızca ADMIN — tüm uzman ve yönetici profilleri */
  specialists?: SpecialistSummaryRow[];
  /** Yalnızca ADMIN — başarılı sınavlar (sertifika özeti) */
  adminCertificates?: AdminCertificateSummaryRow[];
  kayitBasarili: boolean;
};

export function UzmanPanel({
  profile,
  userId,
  userRole,
  userEmail,
  myCourses,
  companies,
  assignments,
  quizzesByCourseId,
  workers,
  progressRows,
  authActivityLog: authActivityLogProp,
  specialists: specialistsProp,
  adminCertificates: adminCertificatesProp,
  kayitBasarili,
}: Props) {
  const authActivityLog = authActivityLogProp ?? [];
  const specialists = specialistsProp ?? [];
  const adminCertificates = adminCertificatesProp ?? [];
  const router = useRouter();
  const [quizCourse, setQuizCourse] = useState<CourseRow | null>(null);
  const [quizPreview, setQuizPreview] = useState<{
    course: CourseRow;
    quiz: QuizRow;
  } | null>(null);
  const [editCourse, setEditCourse] = useState<CourseRow | null>(null);
  const [editCompany, setEditCompany] = useState<CompanyRow | null>(null);
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteCompanyTarget, setDeleteCompanyTarget] =
    useState<CompanyRow | null>(null);
  const [pendingDeleteCourse, startDeleteCourse] = useTransition();
  const [pendingDeleteCompany, startDeleteCompany] = useTransition();
  const [companySearch, setCompanySearch] = useState("");
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerFilterCompanyId, setWorkerFilterCompanyId] = useState("");
  const [exporting, setExporting] = useState(false);

  const canManageCompany = (c: CompanyRow) =>
    userRole === "ADMIN" || c.created_by === userId;

  const companyName = (id: string) => {
    const n = companies.find((c) => c.id === id)?.name?.trim();
    if (n) return n;
    return `Şirket (${id.slice(0, 8)}…)`;
  };

  const assignedForCourse = (courseId: string) =>
    assignments.filter((a) => a.course_id === courseId).map((a) => a.company_id);

  const assignedCourseCountForCompany = (companyId: string) => {
    const ids = new Set(
      assignments
        .filter((a) => a.company_id === companyId)
        .map((a) => a.course_id)
    );
    return ids.size;
  };

  const companiesSortedByName = useMemo(
    () =>
      [...companies].sort((a, b) =>
        a.name.localeCompare(b.name, "tr", { sensitivity: "base" })
      ),
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLocaleLowerCase("tr-TR");
    if (!q) return companies;
    const qCode = q.replace(/\s/g, "").toUpperCase();
    return companies.filter((c) => {
      const name = c.name.toLocaleLowerCase("tr-TR");
      const code = (c.invite_code ?? "").toUpperCase();
      return name.includes(q) || code.includes(qCode);
    });
  }, [companies, companySearch]);

  const filteredWorkers = useMemo(() => {
    const resolveCo = (id: string) => {
      const n = companies.find((c) => c.id === id)?.name?.trim();
      if (n) return n;
      return `Şirket (${id.slice(0, 8)}…)`;
    };
    let list = workers;
    if (workerFilterCompanyId) {
      list = list.filter((w) => w.company_id === workerFilterCompanyId);
    }
    const q = workerSearch.trim().toLocaleLowerCase("tr-TR");
    if (q) {
      list = list.filter((w) => {
        const name = (w.full_name ?? "").toLocaleLowerCase("tr-TR");
        const email = w.email.toLocaleLowerCase("tr-TR");
        const tc = (w.tc_kimlik_no ?? "").toLowerCase();
        const ph = (w.phone ?? "").toLowerCase();
        const co = resolveCo(w.company_id).toLocaleLowerCase("tr-TR");
        return (
          name.includes(q) ||
          email.includes(q) ||
          tc.includes(q) ||
          ph.includes(q) ||
          co.includes(q)
        );
      });
    }
    return list;
  }, [workers, workerFilterCompanyId, workerSearch, companies]);

  async function handleExportSirketler() {
    if (filteredCompanies.length === 0) {
      toast.error("Dışa aktarılacak şirket yok.");
      return;
    }
    setExporting(true);
    try {
      await downloadSirketlerExcel(
        filteredCompanies.map((c) => ({
          "Şirket adı": c.name,
          "Davet kodu": c.invite_code,
        }))
      );
      toast.success("Şirket listesi indirildi.");
    } catch (e) {
      console.error(e);
      toast.error("Excel oluşturulamadı.");
    } finally {
      setExporting(false);
    }
  }

  async function handleExportPersonel() {
    if (filteredWorkers.length === 0) {
      toast.error("Dışa aktarılacak personel yok.");
      return;
    }
    setExporting(true);
    try {
      await downloadPersonelExcel(
        filteredWorkers.map((w) => ({
          Ad: w.full_name?.trim() || "—",
          "T.C. Kimlik": w.tc_kimlik_no?.trim() || "—",
          Telefon: w.phone?.trim() || "—",
          "E-posta": w.email,
          Şirket: companyName(w.company_id),
          "Atanan eğitim": assignedCourseCountForCompany(w.company_id),
        }))
      );
      toast.success("Personel listesi indirildi.");
    } catch (e) {
      console.error(e);
      toast.error("Excel oluşturulamadı.");
    } finally {
      setExporting(false);
    }
  }

  const progressStatusBadge = (row: UzmanProgressRow) => {
    const base =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    switch (row.status) {
      case "passed":
        return (
          <span className={`${base} border border-emerald-500/35 bg-emerald-500/15 text-emerald-200`}>
            Tamamlandı
          </span>
        );
      case "failed":
        return (
          <span className={`${base} border border-red-500/35 bg-red-500/15 text-red-200`}>
            Baraj altı
          </span>
        );
      case "pending":
        return (
          <span className={`${base} border border-zinc-500/35 bg-zinc-500/10 text-zinc-300`}>
            Sınava girilmedi
          </span>
        );
      default:
        return (
          <span className={`${base} border border-amber-500/35 bg-amber-500/15 text-amber-100`}>
            Sınav tanımsız
          </span>
        );
    }
  };

  const confirmDeleteCourse = () => {
    if (!deleteCourseTarget) return;
    startDeleteCourse(async () => {
      const r = await deleteCourse(deleteCourseTarget.id);
      if (r.ok) {
        toast.success("Eğitim silindi.");
        setDeleteCourseTarget(null);
        router.refresh();
      } else {
        toast.error(r.error ?? "Eğitim silinemedi.");
      }
    });
  };

  const confirmDeleteCompany = () => {
    if (!deleteCompanyTarget) return;
    startDeleteCompany(async () => {
      const r = await deleteCompany(deleteCompanyTarget.id);
      if (r.ok) {
        toast.success("Şirket silindi.");
        setDeleteCompanyTarget(null);
        router.refresh();
      } else {
        toast.error(r.error ?? "Şirket silinemedi.");
      }
    });
  };

  const isAdmin = userRole === "ADMIN";

  function scrollAdminTo(anchorId: string) {
    document.getElementById(anchorId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const adminNavItems: { id: string; label: string }[] = [
    { id: "admin-overview", label: "Özet" },
    { id: "admin-courses", label: "Eğitimler" },
    { id: "admin-companies", label: "Şirketler" },
    { id: "admin-specialists", label: "Uzmanlar" },
    { id: "admin-personnel", label: "Personel" },
    { id: "admin-certificates", label: "Sertifikalar" },
    { id: "admin-sessions", label: "Oturum" },
    { id: "admin-progress", label: "İlerleme" },
  ];

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      {isAdmin ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_75%_60%_at_50%_-25%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(6,182,212,0.08),transparent)]"
        />
      ) : null}
      <main
        className={`relative mx-auto px-4 py-8 sm:px-6 sm:py-12 ${
          isAdmin ? "max-w-7xl" : "max-w-6xl"
        }`}
      >
        {kayitBasarili ? (
          <div
            role="status"
            className="relative mb-10 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-5 sm:p-6"
          >
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <Sparkles className="h-6 w-6 text-amber-300" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-100">
                  Kayıt tamamlandı
                </p>
                <p className="mt-1 text-sm text-emerald-100/90">
                  Uzman panelinden eğitimlerinizi yönetebilir ve şirketlere
                  atayabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {isAdmin ? (
          <nav
            className="sticky top-0 z-40 -mx-4 mb-8 flex flex-wrap items-center gap-2 border-b border-white/10 bg-zinc-950/90 px-2 py-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.65)] backdrop-blur-md sm:-mx-6 sm:px-3"
            aria-label="Yönetim bölümleri"
          >
            {adminNavItems.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollAdminTo(id)}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-zinc-300 shadow-sm transition hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 sm:text-sm"
              >
                {label}
              </button>
            ))}
          </nav>
        ) : null}

        <div
          id={isAdmin ? "admin-overview" : undefined}
          className={`space-y-8 ${isAdmin ? "scroll-mt-28" : ""}`}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-violet-300/90">
                {isAdmin ? (
                  <LayoutDashboard className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                ) : null}
                {isAdmin ? "Yönetim paneli" : "Uzman paneli"}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Merhaba{profile?.full_name ? `, ${profile.full_name}` : ""}
              </h1>
              <p className="mt-2 max-w-prose text-sm text-zinc-400">
                {isAdmin
                  ? "Tüm şirketler, eğitimler, uzmanlar ve personel kayıtlarını görüntüleyebilir; sistem genelinde atama ve düzenleme yapabilirsiniz."
                  : "Eğitim ve şirket atamalarını yönetin; personeli ve sınav ilerlemesini aşağıdan izleyin."}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-400">
              {isAdmin ? (
                <Shield className="h-4 w-4 text-violet-400" aria-hidden />
              ) : (
                <GraduationCap className="h-4 w-4 text-violet-400" aria-hidden />
              )}
              {isAdmin ? "ADMIN" : profile?.role ?? "UZMAN"}
            </div>
          </div>

          {isAdmin ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.12] via-white/[0.02] to-transparent p-5 ring-1 ring-inset ring-white/5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Hesap
                  </p>
                  <Mail className="h-5 w-5 shrink-0 text-violet-400/85" aria-hidden />
                </div>
                <p className="mt-2 break-all text-sm font-medium leading-snug text-zinc-100">
                  {profile?.email ?? userEmail ?? "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/[0.10] via-white/[0.02] to-transparent p-5 ring-1 ring-inset ring-white/5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Eğitimler
                  </p>
                  <BookMarked className="h-5 w-5 shrink-0 text-fuchsia-400/85" aria-hidden />
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">
                  {myCourses.length}
                </p>
                <p className="mt-1 text-xs text-zinc-500">Sistemdeki içerik</p>
              </div>
              <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.10] via-white/[0.02] to-transparent p-5 ring-1 ring-inset ring-white/5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Şirketler
                  </p>
                  <Building2 className="h-5 w-5 shrink-0 text-cyan-400/85" aria-hidden />
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">
                  {companies.length}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.10] via-white/[0.02] to-transparent p-5 ring-1 ring-inset ring-white/5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Uzman / yönetici
                  </p>
                  <UserCircle2 className="h-5 w-5 shrink-0 text-amber-400/85" aria-hidden />
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">
                  {specialists.length}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.10] via-white/[0.02] to-transparent p-5 ring-1 ring-inset ring-white/5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Personel
                  </p>
                  <Users className="h-5 w-5 shrink-0 text-emerald-400/85" aria-hidden />
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">
                  {workers.length}
                </p>
              </div>
            </div>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  E-posta
                </dt>
                <dd className="mt-1 break-all text-sm text-zinc-200">
                  {profile?.email ?? userEmail ?? "—"}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Eğitim sayısı
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">
                  {myCourses.length}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Şirket sayısı
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">
                  {companies.length}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  İSG lisans no
                </dt>
                <dd className="mt-1 break-all font-mono text-sm text-zinc-200 sm:text-base">
                  {profile?.isg_license_number?.trim() || "—"}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Personel
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">
                  {workers.length}
                </dd>
              </div>
            </dl>
          )}
        </div>

        {/* Eğitimlerim */}
        <section
          id={isAdmin ? "admin-courses" : undefined}
          className={isAdmin ? "mt-14 scroll-mt-28" : "mt-14"}
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <BookMarked
                className="h-6 w-6 text-violet-400"
                strokeWidth={1.5}
              />
              <h2 className="text-xl font-semibold text-white">
                {userRole === "ADMIN" ? "Tüm eğitimler" : "Eğitimlerim"}
              </h2>
            </div>
            <AddCourseModal
              defaultSpecialistName={profile?.full_name?.trim() ?? ""}
            />
          </div>

          {myCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
              <Layers className="mx-auto h-10 w-10 text-zinc-600" aria-hidden />
              <p className="mt-4 text-sm text-zinc-400">
                Henüz eğitim yok. Sağ üstten &quot;Yeni Eğitim Ekle&quot; ile
                oluşturabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-zinc-500">
                      <th className="px-4 py-3 font-medium sm:px-6">Başlık</th>
                      <th className="px-4 py-3 font-medium sm:px-6">Uzman</th>
                      <th className="px-4 py-3 font-medium sm:px-6">
                        Atanan şirketler
                      </th>
                      <th className="px-4 py-3 font-medium sm:px-6">İzle</th>
                      <th className="px-4 py-3 font-medium sm:px-6">Atama</th>
                      <th className="px-4 py-3 font-medium sm:px-6">Sınav</th>
                      <th className="px-4 py-3 text-right font-medium sm:px-6">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myCourses.map((course) => {
                      const assignedIds = assignedForCourse(course.id);
                      return (
                        <tr
                          key={course.id}
                          className="transition hover:bg-white/[0.03]"
                        >
                          <td className="px-4 py-4 font-medium text-white sm:px-6">
                            {course.title}
                          </td>
                          <td className="px-4 py-4 text-zinc-400 sm:px-6">
                            <span className="inline-flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-zinc-500" />
                              {course.specialist_name ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <div className="flex max-w-xs flex-wrap gap-1.5">
                              {assignedIds.length === 0 ? (
                                <span className="text-zinc-500">—</span>
                              ) : (
                                assignedIds.map((cid) => (
                                  <CourseAssignmentTag
                                    key={cid}
                                    courseId={course.id}
                                    companyId={cid}
                                    label={companyName(cid)}
                                  />
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <Link
                              href={`/egitim/${course.id}`}
                              className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300"
                            >
                              <Play className="h-4 w-4" aria-hidden />
                              Aç
                            </Link>
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <AssignCompanyModal
                              courseId={course.id}
                              courseTitle={course.title}
                              companies={companies}
                              assignedCompanyIds={assignedIds}
                            />
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => setQuizCourse(course)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100 transition hover:bg-amber-500/20"
                              >
                                <ClipboardList
                                  className="h-3.5 w-3.5 shrink-0"
                                  aria-hidden
                                />
                                {quizzesByCourseId[course.id]
                                  ? "Sınavı düzenle"
                                  : "Sınav hazırla"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const q = quizzesByCourseId[course.id];
                                  if (!q) {
                                    toast.error(
                                      "Önce sınav hazırlayın; ardından önizleyebilirsiniz."
                                    );
                                    return;
                                  }
                                  setQuizPreview({ course, quiz: q });
                                }}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-500/35 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-400/50 hover:bg-white/10"
                              >
                                <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                Önizle
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right sm:px-6">
                            <div className="inline-flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setEditCourse(course)}
                                className="rounded-lg p-2 text-zinc-400 transition hover:bg-violet-500/15 hover:text-violet-300"
                                title="Düzenle"
                              >
                                <Pencil className="h-4 w-4" aria-hidden />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteCourseTarget({
                                    id: course.id,
                                    title: course.title,
                                  })
                                }
                                className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/15 hover:text-red-400"
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Şirketler */}
        <section
          id={isAdmin ? "admin-companies" : undefined}
          className={isAdmin ? "mt-14 scroll-mt-28" : "mt-14"}
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Building2
                className="h-6 w-6 text-cyan-400"
                strokeWidth={1.5}
              />
              <h2 className="text-xl font-semibold text-white">Şirketler</h2>
            </div>
            <AddCompanyModal />
          </div>

          {companies.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Kayıtlı şirket bulunmuyor. (RLS veya veri eksikse listeyi
              göremeyebilirsiniz — `rls-uzman-rbac.sql` dosyasını çalıştırın.)
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="Şirket adı veya davet kodu ara…"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                    autoComplete="off"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleExportSirketler()}
                  disabled={exporting || filteredCompanies.length === 0}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-cyan-500/35 hover:bg-cyan-500/10 hover:text-white disabled:pointer-events-none disabled:opacity-40"
                >
                  <FileDown className="h-4 w-4 shrink-0" aria-hidden />
                  Excel&apos;e aktar
                </button>
              </div>
              {filteredCompanies.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Aramanızla eşleşen şirket yok.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCompanies.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 font-medium text-white">
                          {c.name}
                        </p>
                        {canManageCompany(c) ? (
                          <div className="flex shrink-0 items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => setEditCompany(c)}
                              className="rounded-lg p-2 text-zinc-400 transition hover:bg-cyan-500/15 hover:text-cyan-300"
                              title="Düzenle"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCompanyTarget(c)}
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/15 hover:text-red-400"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-2 font-mono text-xs text-zinc-500">
                        {c.invite_code}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {userRole === "ADMIN" ? (
          <section id="admin-specialists" className="mt-14 scroll-mt-28">
            <div className="mb-6 flex items-center gap-2">
              <User
                className="h-6 w-6 text-amber-400"
                strokeWidth={1.5}
                aria-hidden
              />
              <h2 className="text-xl font-semibold text-white">
                Uzmanlar ve yöneticiler
              </h2>
            </div>
            <p className="mb-6 max-w-2xl text-sm text-zinc-500">
              Kayıtlı İSG uzmanı ve sistem yöneticisi hesapları (tüm sistem).
            </p>
            {specialists.length === 0 ? (
              <p className="text-sm text-zinc-500">Kayıt bulunmuyor.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-zinc-500">
                        <th className="px-4 py-3 font-medium sm:px-6">Ad</th>
                        <th className="px-4 py-3 font-medium sm:px-6">E-posta</th>
                        <th className="px-4 py-3 font-medium sm:px-6">Rol</th>
                        <th className="px-4 py-3 font-medium sm:px-6">
                          İSG uzmanlık no
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {specialists.map((s) => (
                        <tr
                          key={s.id}
                          className="transition hover:bg-white/[0.03]"
                        >
                          <td className="px-4 py-3.5 font-medium text-white sm:px-6">
                            {s.full_name?.trim() || "—"}
                          </td>
                          <td className="px-4 py-3.5 break-all text-zinc-400 sm:px-6">
                            {s.email}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-300 sm:px-6">
                            {s.role}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-zinc-400 sm:px-6">
                            {s.isg_license_number?.trim() || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        ) : null}

        {/* Personel */}
        <section
          id={isAdmin ? "admin-personnel" : undefined}
          className={isAdmin ? "mt-14 scroll-mt-28" : "mt-14"}
        >
          <div className="mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" strokeWidth={1.5} aria-hidden />
            <h2 className="text-xl font-semibold text-white">Personel</h2>
          </div>
          <p className="mb-6 max-w-2xl text-sm text-zinc-500">
            {userRole === "ADMIN"
              ? "Sistemdeki tüm şirketlere bağlı personel."
              : "Kendi eklediğiniz şirketlerdeki veya eğitim atadığınız şirketlerdeki personel listelenir."}
          </p>
          {workers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
              <Users className="mx-auto h-10 w-10 text-zinc-600" aria-hidden />
              <p className="mt-4 text-sm text-zinc-400">
                Henüz listelenecek personel yok. Şirket oluşturup davet kodunu
                paylaşın ve eğitimi şirkete atayın; personel kayıt olduktan sonra
                burada görünür.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="relative min-w-0 flex-1 sm:max-w-md">
                    <label className="mb-1 block text-xs font-medium text-zinc-500">
                      Ara
                    </label>
                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                        aria-hidden
                      />
                      <input
                        type="search"
                        value={workerSearch}
                        onChange={(e) => setWorkerSearch(e.target.value)}
                        placeholder="Ad, e-posta veya şirket…"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/25"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="w-full min-w-0 sm:w-56 lg:w-64">
                    <label
                      htmlFor="uzman-personel-sirket-filtre"
                      className="mb-1 block text-xs font-medium text-zinc-500"
                    >
                      Şirket filtresi
                    </label>
                    <select
                      id="uzman-personel-sirket-filtre"
                      value={workerFilterCompanyId}
                      onChange={(e) => setWorkerFilterCompanyId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-zinc-900 py-2.5 pl-3 pr-8 text-sm text-white focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/25"
                    >
                      <option value="">Tüm şirketler</option>
                      {companiesSortedByName.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleExportPersonel()}
                  disabled={exporting || filteredWorkers.length === 0}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-emerald-500/35 hover:bg-emerald-500/10 hover:text-white disabled:pointer-events-none disabled:opacity-40 lg:mb-0"
                >
                  <FileDown className="h-4 w-4 shrink-0" aria-hidden />
                  Excel&apos;e aktar
                </button>
              </div>
              {filteredWorkers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
                  <p className="text-sm text-zinc-400">
                    Filtre veya aramanızla eşleşen personel yok.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-zinc-500">
                          <th className="px-4 py-3 font-medium sm:px-6">Ad</th>
                          <th className="px-4 py-3 font-medium sm:px-6">
                            T.C. Kimlik
                          </th>
                          <th className="px-4 py-3 font-medium sm:px-6">
                            Telefon
                          </th>
                          <th className="px-4 py-3 font-medium sm:px-6">
                            Şirket
                          </th>
                          <th className="px-4 py-3 font-medium sm:px-6">
                            Atanan eğitim
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredWorkers.map((w) => (
                          <tr
                            key={w.id}
                            className="transition hover:bg-white/[0.03]"
                          >
                            <td className="px-4 py-3.5 font-medium text-white sm:px-6">
                              {w.full_name?.trim() || "—"}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-zinc-300 sm:px-6">
                              {w.tc_kimlik_no?.trim() || "—"}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-zinc-400 sm:px-6">
                              {w.phone?.trim() || "—"}
                            </td>
                            <td className="px-4 py-3.5 text-zinc-300 sm:px-6">
                              {companyName(w.company_id)}
                            </td>
                            <td className="px-4 py-3.5 text-zinc-400 sm:px-6">
                              {assignedCourseCountForCompany(w.company_id)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {userRole === "ADMIN" ? (
          <section id="admin-certificates" className="mt-14 scroll-mt-28">
            <div className="mb-6 flex items-center gap-2">
              <Award
                className="h-6 w-6 text-amber-300"
                strokeWidth={1.5}
                aria-hidden
              />
              <h2 className="text-xl font-semibold text-white">
                Sertifikalar (başarılı sınavlar)
              </h2>
            </div>
            <p className="mb-6 max-w-2xl text-sm text-zinc-500">
              Son 500 başarılı sınav; sertifika numarası uygulamadaki gösterimle
              aynı formattadır. Belgeyi ilgili personel hesabıyla
              görüntüleyebilirsiniz.
            </p>
            {adminCertificates.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Henüz kayıtlı başarılı sınav yok.
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-zinc-500">
                        <th className="px-4 py-3 font-medium sm:px-6">
                          Sertifika no
                        </th>
                        <th className="px-4 py-3 font-medium sm:px-6">Kişi</th>
                        <th className="px-4 py-3 font-medium sm:px-6">
                          Eğitim
                        </th>
                        <th className="px-4 py-3 font-medium sm:px-6">Puan</th>
                        <th className="px-4 py-3 font-medium sm:px-6">
                          Tarih
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminCertificates.map((c) => (
                        <tr
                          key={c.resultId}
                          className="transition hover:bg-white/[0.03]"
                        >
                          <td className="px-4 py-3.5 font-mono text-xs text-amber-200/90 sm:px-6">
                            {c.certLabel}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-200 sm:px-6">
                            {c.personName}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-300 sm:px-6">
                            {c.courseTitle}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-400 sm:px-6">
                            {c.score}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-500 sm:px-6">
                            {new Date(c.issuedAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        ) : null}

        {/* Personel oturum kayıtları (giriş/çıkış) */}
        <section
          id={isAdmin ? "admin-sessions" : "audit-sessions"}
          className={isAdmin ? "mt-14 scroll-mt-28" : "mt-14"}
        >
          <div className="mb-6 flex items-center gap-2">
            <Clock
              className="h-6 w-6 text-sky-400"
              strokeWidth={1.5}
              aria-hidden
            />
            <h2 className="text-xl font-semibold text-white">
              Personel oturum kayıtları
            </h2>
          </div>
          <p className="mb-6 max-w-2xl text-sm text-zinc-500">
            Platforma giriş ve çıkış zamanları (personel hesapları). Kayıtlar
            başarılı giriş ve «Çıkış» ile oluşur; yasal denetim için saklanır.
          </p>
          {authActivityLog.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Henüz kayıt yok veya tablo henüz oluşturulmadı (Supabase’de{" "}
              <code className="rounded bg-white/10 px-1 text-xs">
                migration-training-audit.sql
              </code>{" "}
              çalıştırın).
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-zinc-500">
                      <th className="px-4 py-3 font-medium sm:px-6">Zaman</th>
                      <th className="px-4 py-3 font-medium sm:px-6">
                        Personel
                      </th>
                      <th className="px-4 py-3 font-medium sm:px-6">Olay</th>
                      <th className="px-4 py-3 font-medium sm:px-6">
                        Tarayıcı / cihaz (kısa)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {authActivityLog.map((row) => (
                      <tr
                        key={row.id}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 text-zinc-400 sm:px-6">
                          {new Date(row.createdAt).toLocaleString("tr-TR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-white sm:px-6">
                          {row.workerName}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-300 sm:px-6">
                          {row.eventLabel}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3.5 text-xs text-zinc-500 sm:px-6">
                          {row.userAgentShort ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* İlerleme + eğitim süresi denetimi */}
        <section
          id={isAdmin ? "admin-progress" : undefined}
          className={isAdmin ? "mt-14 scroll-mt-28" : "mt-14"}
        >
          <div className="mb-6 flex items-center gap-2">
            <BarChart3
              className="h-6 w-6 text-amber-400"
              strokeWidth={1.5}
              aria-hidden
            />
            <h2 className="text-xl font-semibold text-white">
              Eğitim ilerlemesi ve izlenme
            </h2>
          </div>
          <p className="mb-6 max-w-2xl text-sm text-zinc-500">
            {isAdmin
              ? "Atanmış eğitimlerde sınav durumu, puan ve (personelin eğitim sayfasında geçirdiği) tahmini izlenme süresi. Tamamlanma oranı: sınav geçildiyse %100; aksi halde ~45 dk videoya göre tahmini içerik ilerlemesi. Ölçme sonuçları her sınav denemesi için veritabanında saklanır (puan, doğru sayısı ve şık seçimleri)."
              : "Şirketinize atanmış eğitimlerde sınav ve izlenme özeti. Personel eğitim sayfasında sekme açıkken süre toplanır; sınav cevapları kayıt altındadır."}
          </p>
          {progressRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-zinc-600" aria-hidden />
              <p className="mt-4 text-sm text-zinc-400">
                Atanmış eğitim ve kayıtlı personel olduğunda ilerleme tablosu
                dolacaktır.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-zinc-500">
                      <th className="px-4 py-3 font-medium sm:px-6">Personel</th>
                      <th className="px-4 py-3 font-medium sm:px-6">Şirket</th>
                      <th className="px-4 py-3 font-medium sm:px-6">Eğitim</th>
                      <th className="px-4 py-3 font-medium sm:px-6">Durum</th>
                      <th className="px-4 py-3 font-medium sm:px-6">Puan</th>
                      <th className="px-4 py-3 font-medium sm:px-6">Baraj</th>
                      <th className="px-4 py-3 font-medium sm:px-6">
                        Video (dk)
                      </th>
                      <th className="px-4 py-3 font-medium sm:px-6">Giriş</th>
                      <th className="px-4 py-3 font-medium sm:px-6">
                        Son izleme
                      </th>
                      <th className="px-4 py-3 font-medium sm:px-6">
                        Tahmini %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {progressRows.map((row) => (
                      <tr
                        key={row.key}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3.5 sm:px-6">
                          <p className="font-medium text-white">
                            {row.workerName}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {row.workerEmail}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-300 sm:px-6">
                          {row.companyName}
                        </td>
                        <td className="px-4 py-3.5 text-white sm:px-6">
                          {row.courseTitle}
                        </td>
                        <td className="px-4 py-3.5 sm:px-6">
                          {progressStatusBadge(row)}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-400 sm:px-6">
                          {row.scoreText ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-500 sm:px-6">
                          {row.passingScore != null
                            ? `%${row.passingScore}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-zinc-400 sm:px-6">
                          {row.watchMinutes != null && row.watchMinutes > 0
                            ? row.watchMinutes
                            : "—"}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-zinc-400 sm:px-6">
                          {row.sessionOpens != null && row.sessionOpens > 0
                            ? row.sessionOpens
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500 sm:px-6">
                          {row.lastVideoAt
                            ? new Date(row.lastVideoAt).toLocaleString(
                                "tr-TR",
                                {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }
                              )
                            : "—"}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-zinc-300 sm:px-6">
                          {row.completionEstimatePct != null
                            ? `%${row.completionEstimatePct}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {quizPreview ? (
        <PreviewQuizModal
          key={quizPreview.quiz.id}
          course={quizPreview.course}
          quiz={quizPreview.quiz}
          onClose={() => setQuizPreview(null)}
        />
      ) : null}

      {quizCourse ? (
        <ManageQuizModal
          key={`${quizCourse.id}-${quizzesByCourseId[quizCourse.id]?.id ?? "new"}`}
          course={quizCourse}
          existingQuiz={quizzesByCourseId[quizCourse.id] ?? null}
          onClose={() => setQuizCourse(null)}
        />
      ) : null}

      {editCourse ? (
        <EditCourseModal
          key={editCourse.id}
          course={editCourse}
          defaultSpecialistName={profile?.full_name?.trim() ?? ""}
          onClose={() => setEditCourse(null)}
        />
      ) : null}

      {editCompany ? (
        <EditCompanyModal
          key={editCompany.id}
          company={editCompany}
          onClose={() => setEditCompany(null)}
        />
      ) : null}

      <DestructiveConfirmDialog
        open={deleteCourseTarget !== null}
        title="Eğitimi sil"
        description={
          deleteCourseTarget
            ? `Bu eğitimi silmek istediğinize emin misiniz? «${deleteCourseTarget.title}» silinecek; ona bağlı tüm şirket atamaları da kalıcı olarak kaldırılacak.`
            : ""
        }
        confirmLabel="Eğitimi sil"
        pending={pendingDeleteCourse}
        onClose={() => setDeleteCourseTarget(null)}
        onConfirm={confirmDeleteCourse}
      />

      <DestructiveConfirmDialog
        open={deleteCompanyTarget !== null}
        title="Şirketi sil"
        description={
          deleteCompanyTarget
            ? `«${deleteCompanyTarget.name}»: Bu şirketi silerseniz, bu şirkete bağlı tüm personel erişimi ve eğitim atamaları da silinecektir. Devam etmek istiyor musunuz?`
            : ""
        }
        confirmLabel="Şirketi sil"
        pending={pendingDeleteCompany}
        onClose={() => setDeleteCompanyTarget(null)}
        onConfirm={confirmDeleteCompany}
      />
    </div>
  );
}
