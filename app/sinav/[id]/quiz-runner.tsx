"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { PageBackBar } from "@/components/page-back-bar";
import { submitQuizResult, type SubmitQuizResult } from "../submit-quiz-action";

type QuestionView = {
  text: string;
  options: string[];
};

const LABELS = ["A", "B", "C", "D"] as const;

type Props = {
  courseId: string;
  courseTitle: string;
  quizId: string;
  passingScore: number;
  questions: QuestionView[];
};

export function QuizRunner({
  courseId,
  courseTitle,
  quizId,
  passingScore,
  questions,
}: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(questions.length).fill(null)
  );
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitQuizResult | null>(null);

  const total = questions.length;
  const progress = total > 0 ? ((step + 1) / total) * 100 : 0;
  const current = questions[step];
  const selected = answers[step];

  const canGoNext = selected !== null && selected !== undefined;
  const isLast = step === total - 1;

  const setChoice = (optIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = optIndex;
      return next;
    });
  };

  const goNext = async () => {
    if (!canGoNext) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    const filled = answers.every((a) => a !== null);
    if (!filled) return;
    setSubmitting(true);
    const r = await submitQuizResult({
      courseId,
      answers: answers as number[],
    });
    setSubmitting(false);
    setResult(r);
    if (r.ok) {
      setPhase("result");
    }
  };

  const backBar = (
    <PageBackBar href={`/egitim/${courseId}`} containerClass="max-w-2xl">
      Eğitime dön
    </PageBackBar>
  );

  if (phase === "result" && result?.ok && result.score !== undefined) {
    const passed = result.passed === true;
    return (
      <div className="min-h-full bg-zinc-950 text-zinc-50">
        {backBar}
        <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-10"
          >
            {passed ? (
              <>
                <div className="flex justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-9 w-9" aria-hidden />
                  </span>
                </div>
                <h1 className="mt-6 text-center text-xl font-semibold text-white sm:text-2xl">
                  Tebrikler! Geçtiniz.
                </h1>
                <p className="mt-3 text-center text-sm text-zinc-400">
                  Puanınız:{" "}
                  <span className="font-semibold text-emerald-300">
                    {result.score}
                  </span>{" "}
                  / 100
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href={`/sertifika/${courseId}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/30"
                  >
                    <Award className="h-5 w-5" aria-hidden />
                    Sertifikayı görüntüle
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-6 text-sm font-medium text-zinc-300 hover:bg-white/5"
                  >
                    Panele dön
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                    <XCircle className="h-9 w-9" aria-hidden />
                  </span>
                </div>
                <h1 className="mt-6 text-center text-xl font-semibold text-white sm:text-2xl">
                  Maalesef barajın altında kaldınız.
                </h1>
                <p className="mt-4 text-center text-sm leading-relaxed text-zinc-400">
                  Videoyu tekrar izleyip yeniden deneyebilirsiniz.
                </p>
                <p className="mt-2 text-center text-sm text-zinc-500">
                  Puanınız:{" "}
                  <span className="font-medium text-zinc-300">
                    {result.score}
                  </span>{" "}
                  / 100 (Geçme: %{result.passingScore ?? passingScore})
                </p>
                <div className="mt-8 flex justify-center">
                  <Link
                    href={`/egitim/${courseId}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 text-sm font-semibold text-white"
                  >
                    Eğitime geri dön
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </main>
      </div>
    );
  }

  if (phase === "result" && result && !result.ok) {
    return (
      <div className="min-h-full bg-zinc-950 text-zinc-50">
        {backBar}
        <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-red-500/25 bg-red-950/30 p-6 text-center text-sm text-red-100">
            {result.error ?? "Kayıt sırasında hata oluştu."}
          </div>
          <Link
            href={`/egitim/${courseId}`}
            className="mt-6 inline-flex text-sm text-violet-400 hover:text-violet-300"
          >
            Eğitime dön
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      {backBar}

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-wider text-violet-300/80">
          Sınav
        </p>
        <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">
          {courseTitle}
        </h1>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs text-zinc-500">
            <span>
              Soru {step + 1} / {total}
            </span>
            <span>Geçme: %{passingScore}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <div className="relative mt-8 min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${quizId}-${step}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7"
            >
              <p className="text-sm leading-relaxed text-zinc-100 sm:text-base">
                {current?.text}
              </p>
              <ul className="mt-6 space-y-2.5">
                {LABELS.map((label, optIdx) => {
                  const isSel = selected === optIdx;
                  return (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => setChoice(optIdx)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                          isSel
                            ? "border-violet-500/50 bg-violet-500/15 text-white"
                            : "border-white/10 bg-zinc-950/60 text-zinc-300 hover:border-white/20"
                        }`}
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-xs font-bold text-zinc-300">
                          {label}
                        </span>
                        <span className="pt-0.5">{current?.options[optIdx]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext || submitting}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 transition hover:from-violet-500 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              "Gönderiliyor…"
            ) : isLast ? (
              "Sınavı bitir"
            ) : (
              <>
                Sonraki soru
                <ChevronRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
