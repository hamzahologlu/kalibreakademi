"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ClipboardList,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { CourseRow, QuizRow } from "@/lib/supabase";
import { saveQuizForCourse } from "./quiz-actions";
import {
  emptyQuestion,
  normalizeQuestionsFromDb,
  type QuizQuestionPayload,
} from "./quiz-types";

const LABELS = ["A", "B", "C", "D"] as const;

type Props = {
  course: Pick<CourseRow, "id" | "title">;
  existingQuiz: QuizRow | null;
  onClose: () => void;
};

export function ManageQuizModal({ course, existingQuiz, onClose }: Props) {
  const router = useRouter();
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestionPayload[]>([
    emptyQuestion(),
  ]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setPassingScore(existingQuiz?.passing_score ?? 70);
    setQuestions(normalizeQuestionsFromDb(existingQuiz?.questions));
  }, [course.id, existingQuiz]);

  const updateQuestion = (
    index: number,
    patch: Partial<QuizQuestionPayload>
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const next = [...q.options] as [string, string, string, string];
        next[optIndex] = value;
        return { ...q, options: next };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const r = await saveQuizForCourse({
        courseId: course.id,
        passingScore: Number(passingScore),
        questions,
      });
      if (r.ok) {
        toast.success(
          existingQuiz ? "Sınav güncellendi." : "Sınav kaydedildi."
        );
        onClose();
        router.refresh();
      } else {
        toast.error(r.error ?? "Kaydedilemedi.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <ClipboardList className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2
                id="quiz-modal-title"
                className="text-lg font-semibold text-white"
              >
                Sınav hazırla / düzenle
              </h2>
              <p className="mt-1 truncate text-sm text-zinc-400" title={course.title}>
                {course.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="passing-score"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Geçme notu (%)
              </label>
              <input
                id="passing-score"
                type="number"
                min={0}
                max={100}
                step={1}
                disabled={pending}
                value={passingScore}
                onChange={(e) =>
                  setPassingScore(Number(e.target.value) || 0)
                }
                className="w-full max-w-[120px] rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
              />
              <p className="mt-1.5 text-xs text-zinc-500">
                Örn. 70 — doğru cevap oranı bu değerin altındaysa başarısız sayılır.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-zinc-300">Sorular</p>
              <ol className="space-y-4">
                {questions.map((q, qIndex) => (
                  <li
                    key={qIndex}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Soru {qIndex + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        disabled={pending || questions.length <= 1}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 transition hover:bg-red-500/15 hover:text-red-400 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Kaldır
                      </button>
                    </div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                      Soru metni
                    </label>
                    <textarea
                      value={q.text}
                      onChange={(e) =>
                        updateQuestion(qIndex, { text: e.target.value })
                      }
                      disabled={pending}
                      rows={2}
                      placeholder="Soruyu yazın…"
                      className="mb-4 w-full resize-y rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      {LABELS.map((label, optIndex) => (
                        <div key={label}>
                          <label className="mb-1 block text-xs font-medium text-zinc-500">
                            Şık {label}
                          </label>
                          <input
                            type="text"
                            value={q.options[optIndex]}
                            onChange={(e) =>
                              updateOption(qIndex, optIndex, e.target.value)
                            }
                            disabled={pending}
                            placeholder={`Seçenek ${label}`}
                            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
                          />
                        </div>
                      ))}
                    </div>
                    <fieldset className="mt-4 border-0 p-0">
                      <legend className="mb-2 text-xs font-medium text-zinc-500">
                        Doğru şık
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {LABELS.map((label, optIndex) => (
                          <label
                            key={label}
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                              q.correctIndex === optIndex
                                ? "border-amber-500/50 bg-amber-500/15 text-amber-100"
                                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-${course.id}-${qIndex}`}
                              checked={q.correctIndex === optIndex}
                              onChange={() =>
                                updateQuestion(qIndex, {
                                  correctIndex: optIndex as 0 | 1 | 2 | 3,
                                })
                              }
                              disabled={pending}
                              className="sr-only"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                onClick={addQuestion}
                disabled={pending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-sm font-medium text-zinc-300 transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-100 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Yeni soru ekle
              </button>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-white/10 p-5 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/30 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
