"use client";

import { Check, Eye, X } from "lucide-react";
import type { CourseRow, QuizRow } from "@/lib/supabase";
import { normalizeQuestionsFromDb } from "./quiz-types";

const LABELS = ["A", "B", "C", "D"] as const;

type Props = {
  course: Pick<CourseRow, "id" | "title">;
  quiz: QuizRow;
  onClose: () => void;
};

export function PreviewQuizModal({ course, quiz, onClose }: Props) {
  const questions = normalizeQuestionsFromDb(quiz.questions).filter(
    (q) => q.text.trim().length > 0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-quiz-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(90vh,760px)] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-500/20 text-zinc-200">
              <Eye className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2
                id="preview-quiz-title"
                className="text-lg font-semibold text-white"
              >
                Sınav önizleme
              </h2>
              <p
                className="mt-1 truncate text-sm text-zinc-400"
                title={course.title}
              >
                {course.title}
              </p>
              <p className="mt-3 inline-flex rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Geçme notu: %{quiz.passing_score}
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
          {questions.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Bu sınavda henüz görüntülenebilir soru yok. Düzenleyerek soru
              ekleyin.
            </p>
          ) : (
            <ol className="space-y-6">
              {questions.map((q, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Soru {idx + 1}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-100">
                    {q.text}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {LABELS.map((label, optIdx) => {
                      const isCorrect = q.correctIndex === optIdx;
                      return (
                        <li
                          key={label}
                          className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                            isCorrect
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-50"
                              : "border-white/10 bg-zinc-950/80 text-zinc-400"
                          }`}
                        >
                          <span className="mt-0.5 shrink-0 font-mono text-xs font-semibold text-zinc-500">
                            {label}.
                          </span>
                          <span className="min-w-0 flex-1">{q.options[optIdx]}</span>
                          {isCorrect ? (
                            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-300">
                              <Check className="h-4 w-4" aria-hidden />
                              Doğru
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 p-5 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-white/15 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
