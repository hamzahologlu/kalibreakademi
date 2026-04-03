"use server";

import { revalidatePath } from "next/cache";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { createClient } from "@/lib/supabase/server";
import type { QuizQuestionPayload, SaveQuizResult } from "./quiz-types";

function validatePayload(
  passingScore: number,
  questions: QuizQuestionPayload[]
): string | null {
  if (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100) {
    return "Geçme notu 0 ile 100 arasında olmalıdır.";
  }
  if (questions.length < 1) {
    return "En az bir soru ekleyin.";
  }
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.text.trim()) {
      return `Soru ${i + 1}: soru metni boş olamaz.`;
    }
    for (let j = 0; j < 4; j++) {
      if (!q.options[j]?.trim()) {
        return `Soru ${i + 1}: ${String.fromCharCode(65 + j)} şıkkı boş olamaz.`;
      }
    }
    if (q.correctIndex < 0 || q.correctIndex > 3) {
      return `Soru ${i + 1}: geçerli bir doğru şık seçin.`;
    }
  }
  return null;
}

export async function saveQuizForCourse(input: {
  courseId: string;
  passingScore: number;
  questions: QuizQuestionPayload[];
}): Promise<SaveQuizResult> {
  const { courseId, passingScore, questions } = input;

  if (!courseId) {
    return { ok: false, error: "Eğitim seçilemedi." };
  }

  const err = validatePayload(passingScore, questions);
  if (err) {
    return { ok: false, error: err };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Oturum bulunamadı." };
  }

  const profile = await loadMyProfile(supabase);

  if (!profile || (profile.role !== "UZMAN" && profile.role !== "ADMIN")) {
    return { ok: false, error: "Bu işlem için yetkiniz yok." };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, created_by")
    .eq("id", courseId)
    .maybeSingle();

  if (!course || course.created_by !== user.id) {
    return { ok: false, error: "Bu eğitim size ait değil." };
  }

  const serialized = questions.map((q) => ({
    text: q.text.trim(),
    options: [
      q.options[0].trim(),
      q.options[1].trim(),
      q.options[2].trim(),
      q.options[3].trim(),
    ],
    correctIndex: q.correctIndex,
  }));

  const { data: existing } = await supabase
    .from("quizzes")
    .select("id")
    .eq("course_id", courseId)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("quizzes")
      .update({
        questions: serialized,
        passing_score: Math.round(passingScore),
      })
      .eq("id", existing.id);

    if (error) {
      return { ok: false, error: error.message };
    }
  } else {
    const { error } = await supabase.from("quizzes").insert({
      course_id: courseId,
      questions: serialized,
      passing_score: Math.round(passingScore),
    });

    if (error) {
      return { ok: false, error: error.message };
    }
  }

  revalidatePath("/dashboard");
  return { ok: true, error: null };
}
