import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageBackBar } from "@/components/page-back-bar";
import { questionsForQuizTaker } from "@/app/dashboard/quiz-types";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { createClient } from "@/lib/supabase/server";
import { QuizRunner } from "./quiz-runner";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SinavPage({ params }: PageProps) {
  const { id: courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/kayit");
  }

  const profile = await loadMyProfile(supabase);

  if (!profile?.company_id) {
    notFound();
  }

  const { data: assignment } = await supabase
    .from("course_assignments")
    .select("id")
    .eq("course_id", courseId)
    .eq("company_id", profile.company_id)
    .maybeSingle();

  if (!assignment) {
    notFound();
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) {
    notFound();
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, questions, passing_score")
    .eq("course_id", courseId)
    .limit(1)
    .maybeSingle();

  const clientQuestions = quiz
    ? questionsForQuizTaker(quiz.questions)
    : [];

  if (!quiz || clientQuestions.length === 0) {
    return (
      <div className="min-h-full bg-zinc-950 text-zinc-50">
        <PageBackBar href={`/egitim/${courseId}`} containerClass="max-w-2xl">
          Eğitime dön
        </PageBackBar>
        <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <h1 className="text-xl font-semibold text-white">{course.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Bu eğitim için henüz sınav tanımlanmamış veya soru eklenmemiş.
            Uzmanınız sınavı hazırladığında buradan çözebileceksiniz.
          </p>
          <Link
            href={`/egitim/${courseId}`}
            className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-white/10 px-5 text-sm font-medium text-white hover:bg-white/15"
          >
            Eğitime geri dön
          </Link>
        </main>
      </div>
    );
  }

  return (
    <QuizRunner
      courseId={course.id}
      courseTitle={course.title}
      quizId={quiz.id}
      passingScore={quiz.passing_score}
      questions={clientQuestions}
    />
  );
}
