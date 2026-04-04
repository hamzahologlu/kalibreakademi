"use server";

import { createClient } from "@/lib/supabase/server";

export async function openCourseLearningSessionAction(
  courseId: string
): Promise<{ ok: boolean }> {
  if (!courseId) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase.rpc("open_course_learning_session", {
    p_course_id: courseId,
  });
  return { ok: !error };
}

export async function pulseCourseLearningAction(
  courseId: string,
  deltaSeconds: number
): Promise<{ ok: boolean }> {
  if (!courseId) return { ok: false };
  const supabase = await createClient();
  const d = Math.min(120, Math.max(0, Math.floor(deltaSeconds)));
  const { error } = await supabase.rpc("pulse_course_learning", {
    p_course_id: courseId,
    p_delta_seconds: d,
  });
  return { ok: !error };
}
