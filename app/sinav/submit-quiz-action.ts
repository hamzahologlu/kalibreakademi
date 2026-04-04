"use server";

import { revalidatePath } from "next/cache";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { createClient } from "@/lib/supabase/server";
import { normalizeQuestionsFromDb } from "@/app/dashboard/quiz-types";

export type SubmitQuizResult = {
  ok: boolean;
  error: string | null;
  score?: number;
  passed?: boolean;
  passingScore?: number;
  correctCount?: number;
  totalQuestions?: number;
};

export async function submitQuizResult(input: {
  courseId: string;
  answers: number[];
}): Promise<SubmitQuizResult> {
  const { courseId, answers } = input;

  if (!courseId) {
    return { ok: false, error: "Geçersiz eğitim." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Oturum bulunamadı." };
  }

  const profile = await loadMyProfile(supabase);

  if (!profile?.company_id) {
    return { ok: false, error: "Şirket bilgisi bulunamadı." };
  }

  const { data: assignment } = await supabase
    .from("course_assignments")
    .select("id")
    .eq("course_id", courseId)
    .eq("company_id", profile.company_id)
    .maybeSingle();

  if (!assignment) {
    return { ok: false, error: "Bu eğitime erişim yetkiniz yok." };
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, questions, passing_score")
    .eq("course_id", courseId)
    .limit(1)
    .maybeSingle();

  if (!quiz) {
    return { ok: false, error: "Sınav bulunamadı." };
  }

  const graded = normalizeQuestionsFromDb(quiz.questions).filter(
    (q) => q.text.trim().length > 0
  );

  if (graded.length === 0) {
    return { ok: false, error: "Sınavda geçerli soru yok." };
  }

  if (answers.length !== graded.length) {
    return { ok: false, error: "Tüm soruları yanıtlamanız gerekir." };
  }

  for (let i = 0; i < answers.length; i++) {
    const a = answers[i];
    if (
      typeof a !== "number" ||
      !Number.isInteger(a) ||
      a < 0 ||
      a > 3
    ) {
      return { ok: false, error: "Geçersiz cevap gönderimi." };
    }
  }

  let correct = 0;
  for (let i = 0; i < graded.length; i++) {
    if (answers[i] === graded[i].correctIndex) correct += 1;
  }

  const total = graded.length;
  const score = Math.round((correct / total) * 100 * 100) / 100;
  const passingScore = quiz.passing_score;
  const passed = score >= passingScore;

  const answerIndices = answers.map((a) => a as number);

  const baseRow = {
    user_id: user.id,
    course_id: courseId,
    quiz_id: quiz.id,
    score,
    passed,
    correct_count: correct,
    total_questions: total,
  };

  let insertError = (
    await supabase.from("quiz_results").insert({
      ...baseRow,
      answer_indices: answerIndices,
    })
  ).error;

  const msg = insertError?.message?.toLowerCase() ?? "";
  if (insertError && msg.includes("answer_indices")) {
    insertError = (await supabase.from("quiz_results").insert(baseRow)).error;
  }

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/sinav/${courseId}`);
  revalidatePath(`/sertifika/${courseId}`);

  return {
    ok: true,
    error: null,
    score,
    passed,
    passingScore,
    correctCount: correct,
    totalQuestions: total,
  };
}
