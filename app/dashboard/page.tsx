import { redirect } from "next/navigation";
import type { CourseRow, QuizRow, UserRole } from "@/lib/supabase";
import { loadMyCompanyName } from "@/lib/supabase/load-my-company-name";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { loadMyQuizResultsForCourses } from "@/lib/supabase/load-my-quiz-results-for-courses";
import { createClient } from "@/lib/supabase/server";
import {
  UzmanPanel,
  type AdminCertificateSummaryRow,
  type SpecialistSummaryRow,
  type UzmanProgressRow,
  type UzmanWorkerRow,
} from "./uzman-panel";
import {
  WorkerDashboard,
  type WorkerCourseItem,
} from "./worker-dashboard";

type DashboardPageProps = {
  searchParams: Promise<{ kayit?: string }>;
};

function formatAdminCertLabel(resultId: string, createdAtIso: string): string {
  const issuedAt = new Date(createdAtIso);
  const year = issuedAt.getFullYear();
  const segment = resultId.replace(/-/g, "").slice(0, 10).toUpperCase();
  return `KA-${year}-${segment}`;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const q = await searchParams;
  const kayitBasarili = q.kayit === "basarili";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/kayit");
  }

  const row = await loadMyProfile(supabase);
  if (!row) {
    redirect("/kayit");
  }

  const profile = {
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    company_id: row.company_id,
    phone: row.phone,
    tc_kimlik_no: row.tc_kimlik_no,
  };

  const isUzman =
    profile.role === "UZMAN" || profile.role === "ADMIN";
  const isAdmin = profile.role === "ADMIN";

  if (isUzman) {
    let coursesQuery = supabase
      .from("courses")
      .select("id, title, specialist_name, video_url, created_by")
      .order("title", { ascending: true });
    if (!isAdmin) {
      coursesQuery = coursesQuery.eq("created_by", user.id);
    }
    const { data: myCourses } = await coursesQuery;

    const { data: companies } = await supabase
      .from("companies")
      .select("id, name, invite_code, created_at, created_by")
      .order("name", { ascending: true });

    const courseList = (myCourses ?? []) as CourseRow[];
    const courseIds = courseList.map((c) => c.id);

    let assignments: { course_id: string; company_id: string }[] = [];
    if (courseIds.length > 0) {
      const { data: assignRows } = await supabase
        .from("course_assignments")
        .select("course_id, company_id")
        .in("course_id", courseIds);

      assignments = assignRows ?? [];
    }

    const quizzesByCourseId: Record<string, QuizRow> = {};
    if (courseIds.length > 0) {
      const { data: quizRows } = await supabase
        .from("quizzes")
        .select("id, course_id, questions, passing_score")
        .in("course_id", courseIds);

      for (const row of quizRows ?? []) {
        quizzesByCourseId[row.course_id] = row as QuizRow;
      }
    }

    const { data: workerRows } = await supabase
      .from("profiles")
      .select("id, email, full_name, company_id, phone, tc_kimlik_no")
      .eq("role", "WORKER")
      .order("full_name", { ascending: true, nullsFirst: false });

    const workers = (workerRows ?? []) as UzmanWorkerRow[];

    type ResultSlim = {
      user_id: string;
      course_id: string;
      passed: boolean;
      score: number;
      created_at: string;
    };
    let quizResultsSlim: ResultSlim[] = [];
    if (courseIds.length > 0) {
      const { data: resultRows } = await supabase
        .from("quiz_results")
        .select("user_id, course_id, passed, score, created_at")
        .in("course_id", courseIds);

      quizResultsSlim = (resultRows ?? []) as ResultSlim[];
    }

    const companyNameById = new Map(
      (companies ?? []).map((c) => [c.id, c.name] as const)
    );

    const uzmanProgressRows = buildUzmanProgressRows({
      workers,
      courses: courseList,
      assignments,
      quizzesByCourseId,
      results: quizResultsSlim,
      companyNameById,
    });

    let specialists: SpecialistSummaryRow[] = [];
    let adminCertificates: AdminCertificateSummaryRow[] = [];

    if (isAdmin) {
      const { data: specRows } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, isg_license_number")
        .in("role", ["UZMAN", "ADMIN"])
        .order("full_name", { ascending: true, nullsFirst: false });

      specialists = (specRows ?? []) as SpecialistSummaryRow[];

      const { data: passedRows } = await supabase
        .from("quiz_results")
        .select("id, user_id, course_id, score, created_at")
        .eq("passed", true)
        .order("created_at", { ascending: false })
        .limit(500);

      const courseTitleById = new Map(
        courseList.map((c) => [c.id, c.title] as const)
      );
      const userIds = [...new Set((passedRows ?? []).map((p) => p.user_id))];
      const nameByUserId = new Map<string, string>();
      if (userIds.length > 0) {
        const { data: profRows } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);
        for (const p of profRows ?? []) {
          nameByUserId.set(
            p.id,
            p.full_name?.trim() || p.email || "—"
          );
        }
      }

      adminCertificates = (passedRows ?? []).map((r) => ({
        resultId: r.id,
        userId: r.user_id,
        personName: nameByUserId.get(r.user_id) ?? "—",
        courseTitle: courseTitleById.get(r.course_id) ?? "—",
        score: r.score,
        issuedAt: r.created_at,
        certLabel: formatAdminCertLabel(r.id, r.created_at),
      }));
    }

    return (
      <UzmanPanel
        profile={profile}
        userId={user.id}
        userRole={profile.role as UserRole}
        userEmail={user.email ?? null}
        myCourses={courseList}
        companies={companies ?? []}
        assignments={assignments}
        quizzesByCourseId={quizzesByCourseId}
        workers={workers}
        progressRows={uzmanProgressRows}
        specialists={specialists}
        adminCertificates={adminCertificates}
        kayitBasarili={kayitBasarili}
      />
    );
  }

  let companyName: string | null = null;
  if (profile?.company_id) {
    companyName = await loadMyCompanyName(supabase, profile.company_id);
  }

  let workerCourses: WorkerCourseItem[] = [];

  if (profile?.company_id) {
    const { data: assignments } = await supabase
      .from("course_assignments")
      .select("course_id")
      .eq("company_id", profile.company_id);

    const courseIds = [
      ...new Set((assignments ?? []).map((a) => a.course_id)),
    ];

    if (courseIds.length > 0) {
      const { data: courseRows } = await supabase
        .from("courses")
        .select("id, title, specialist_name, video_url")
        .in("id", courseIds)
        .order("title", { ascending: true });

      const courses = courseRows ?? [];

      const { data: quizMeta } = await supabase
        .from("quizzes")
        .select("course_id")
        .in("course_id", courseIds);

      const hasQuizByCourseId = new Set(
        (quizMeta ?? []).map((q) => q.course_id)
      );

      const resultRows = await loadMyQuizResultsForCourses(
        supabase,
        courseIds,
        user.id
      );

      const progressByCourseId = buildCourseProgressMap(resultRows);

      workerCourses = courses.map((c) => ({
        ...c,
        hasQuiz: hasQuizByCourseId.has(c.id),
        progress: progressByCourseId[c.id] ?? { status: "none" as const },
      }));
    }
  }

  return (
    <WorkerDashboard
      profile={profile}
      companyName={companyName}
      courses={workerCourses}
      kayitBasarili={kayitBasarili}
    />
  );
}

type QuizResultRow = {
  course_id: string;
  passed: boolean;
  score: number;
  created_at: string;
};

function workerDisplayName(w: UzmanWorkerRow): string {
  return (
    w.full_name?.trim() ||
    w.tc_kimlik_no?.trim() ||
    w.phone?.trim() ||
    w.email ||
    "Personel"
  );
}

function workerProgressSubtitle(w: UzmanWorkerRow): string {
  const tc = w.tc_kimlik_no?.trim();
  const ph = w.phone?.trim();
  const parts: string[] = [];
  if (tc) parts.push(`T.C. ${tc}`);
  if (ph) parts.push(ph);
  if (parts.length > 0) return parts.join(" · ");
  return w.email ?? "—";
}

function buildUzmanProgressRows({
  workers,
  courses,
  assignments,
  quizzesByCourseId,
  results,
  companyNameById,
}: {
  workers: UzmanWorkerRow[];
  courses: CourseRow[];
  assignments: { course_id: string; company_id: string }[];
  quizzesByCourseId: Record<string, QuizRow>;
  results: {
    user_id: string;
    course_id: string;
    passed: boolean;
    score: number;
    created_at: string;
  }[];
  companyNameById: Map<string, string>;
}): UzmanProgressRow[] {
  const rows: UzmanProgressRow[] = [];

  const isAssigned = (courseId: string, companyId: string) =>
    assignments.some(
      (a) => a.course_id === courseId && a.company_id === companyId
    );

  for (const w of workers) {
    const companyName = companyNameById.get(w.company_id) ?? "—";
    const workerName = workerDisplayName(w);
    const workerEmail = workerProgressSubtitle(w);

    for (const course of courses) {
      if (!isAssigned(course.id, w.company_id)) continue;

      const quiz = quizzesByCourseId[course.id];
      if (!quiz) {
        rows.push({
          key: `${w.id}-${course.id}`,
          workerName,
          workerEmail,
          companyName,
          courseTitle: course.title,
          status: "no_quiz",
          scoreText: null,
          passingScore: null,
        });
        continue;
      }

      const passingScore = quiz.passing_score;
      const userCourseResults = results.filter(
        (r) => r.user_id === w.id && r.course_id === course.id
      );
      const prog = progressFromResultRows(userCourseResults);

      if (prog === "none") {
        rows.push({
          key: `${w.id}-${course.id}`,
          workerName,
          workerEmail,
          companyName,
          courseTitle: course.title,
          status: "pending",
          scoreText: null,
          passingScore,
        });
      } else if (prog.status === "failed") {
        rows.push({
          key: `${w.id}-${course.id}`,
          workerName,
          workerEmail,
          companyName,
          courseTitle: course.title,
          status: "failed",
          scoreText: `${prog.lastScore} / 100`,
          passingScore,
        });
      } else {
        rows.push({
          key: `${w.id}-${course.id}`,
          workerName,
          workerEmail,
          companyName,
          courseTitle: course.title,
          status: "passed",
          scoreText: `${prog.bestScore} / 100`,
          passingScore,
        });
      }
    }
  }

  rows.sort((a, b) => {
    const byCompany = a.companyName.localeCompare(b.companyName, "tr");
    if (byCompany !== 0) return byCompany;
    const byWorker = a.workerName.localeCompare(b.workerName, "tr");
    if (byWorker !== 0) return byWorker;
    return a.courseTitle.localeCompare(b.courseTitle, "tr");
  });

  return rows;
}

type UserCourseProgress =
  | "none"
  | { status: "failed"; lastScore: number }
  | { status: "passed"; bestScore: number };

function progressFromResultRows(
  rows: { passed: boolean; score: number; created_at: string }[]
): UserCourseProgress {
  if (rows.length === 0) return "none";
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  if (sorted.some((x) => x.passed)) {
    const passedScores = sorted
      .filter((x) => x.passed)
      .map((x) => Number(x.score));
    return { status: "passed", bestScore: Math.max(...passedScores) };
  }
  return { status: "failed", lastScore: Number(sorted[0].score) };
}

function buildCourseProgressMap(rows: QuizResultRow[]): Record<
  string,
  | { status: "completed"; bestScore: number }
  | { status: "failed"; lastScore: number }
> {
  const grouped = new Map<string, QuizResultRow[]>();
  for (const r of rows) {
    const arr = grouped.get(r.course_id) ?? [];
    arr.push(r);
    grouped.set(r.course_id, arr);
  }
  const out: Record<
    string,
    | { status: "completed"; bestScore: number }
    | { status: "failed"; lastScore: number }
  > = {};
  for (const [cid, list] of grouped) {
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    if (sorted.some((x) => x.passed)) {
      const passedScores = sorted
        .filter((x) => x.passed)
        .map((x) => Number(x.score));
      out[cid] = {
        status: "completed",
        bestScore: Math.max(...passedScores),
      };
    } else {
      out[cid] = {
        status: "failed",
        lastScore: Number(sorted[0].score),
      };
    }
  }
  return out;
}
