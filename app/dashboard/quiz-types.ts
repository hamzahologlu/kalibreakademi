/** Sınav soruları — quizzes.questions JSONB yapısı */

export type QuizQuestionPayload = {
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export type SaveQuizResult = {
  ok: boolean;
  error: string | null;
};

export function emptyQuestion(): QuizQuestionPayload {
  return {
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  };
}

export function normalizeQuestionsFromDb(raw: unknown): QuizQuestionPayload[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [emptyQuestion()];
  }
  const out: QuizQuestionPayload[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const text = String(o.text ?? o.prompt ?? "").trim();
    let opts: string[] = ["", "", "", ""];
    if (Array.isArray(o.options)) {
      const arr = o.options.slice(0, 4).map((x) => String(x ?? "").trim());
      for (let i = 0; i < 4; i++) opts[i] = arr[i] ?? "";
    }
    let ci = 0;
    if (
      typeof o.correctIndex === "number" &&
      o.correctIndex >= 0 &&
      o.correctIndex <= 3
    ) {
      ci = o.correctIndex;
    }
    out.push({
      text,
      options: [opts[0], opts[1], opts[2], opts[3]],
      correctIndex: ci as 0 | 1 | 2 | 3,
    });
  }
  return out.length > 0 ? out : [emptyQuestion()];
}

/** Personel sınav ekranı — doğru şık bilgisi gönderilmez */
export function questionsForQuizTaker(
  raw: unknown
): { text: string; options: string[] }[] {
  return normalizeQuestionsFromDb(raw)
    .filter((q) => q.text.trim().length > 0)
    .map(({ text, options }) => ({
      text,
      options: [...options],
    }));
}
