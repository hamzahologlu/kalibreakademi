import type { SupabaseClient } from "@supabase/supabase-js";

export type MyQuizResultSlim = {
  course_id: string;
  passed: boolean;
  score: number;
  created_at: string;
};

function rpcLikelyMissing(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = error.message ?? "";
  if (msg.includes("get_my_quiz_results_for_courses")) return true;
  if (error.code === "42883" || error.code === "PGRST202") return true;
  return false;
}

function parseRpcRows(data: unknown): MyQuizResultSlim[] {
  if (!Array.isArray(data)) {
    return [];
  }
  const out: MyQuizResultSlim[] = [];
  for (const item of data) {
    if (item == null || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const courseId = o.course_id;
    if (typeof courseId !== "string") continue;
    out.push({
      course_id: courseId,
      passed: Boolean(o.passed),
      score: Number(o.score),
      created_at:
        typeof o.created_at === "string"
          ? o.created_at
          : String(o.created_at ?? ""),
    });
  }
  return out;
}

/**
 * Panelde tamamlanma rozeti için quiz_results. Önce RPC; yoksa doğrudan SELECT.
 */
export async function loadMyQuizResultsForCourses(
  supabase: SupabaseClient,
  courseIds: string[],
  userId: string
): Promise<MyQuizResultSlim[]> {
  if (courseIds.length === 0) {
    return [];
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_my_quiz_results_for_courses",
    { p_course_ids: courseIds }
  );

  if (!rpcError && rpcData != null) {
    const raw = rpcData as unknown;
    if (Array.isArray(raw)) {
      if (raw.length === 0) {
        return [];
      }
      const fromRpc = parseRpcRows(raw);
      if (fromRpc.length > 0) {
        return fromRpc;
      }
      /* RPC döndü ama parse edilemedi — SELECT ile dene */
    }
  }

  if (rpcError && !rpcLikelyMissing(rpcError)) {
    console.error("[loadMyQuizResultsForCourses] rpc", rpcError.message);
  }

  const { data: rows, error: selError } = await supabase
    .from("quiz_results")
    .select("course_id, passed, score, created_at")
    .eq("user_id", userId)
    .in("course_id", courseIds);

  if (selError) {
    console.error("[loadMyQuizResultsForCourses] select", selError.message);
    return [];
  }

  return (rows ?? []) as MyQuizResultSlim[];
}
