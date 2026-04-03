"use server";

import { revalidatePath } from "next/cache";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { createClient } from "@/lib/supabase/server";
import type { CourseMutationState } from "./dashboard-mutation-state";

async function assertUzmanOrAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      user: null as null,
      profile: null as { role: string; full_name: string | null } | null,
    };
  }
  const row = await loadMyProfile(supabase);
  if (!row) {
    return { user, profile: null };
  }
  return {
    user,
    profile: { role: row.role, full_name: row.full_name },
  };
}

export async function updateCourse(
  _prev: CourseMutationState,
  formData: FormData
): Promise<CourseMutationState> {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const video_url = String(formData.get("video_url") ?? "").trim();
  const specialist_name = String(formData.get("specialist_name") ?? "").trim();

  if (!id) {
    return { ok: false, error: "Eğitim bulunamadı." };
  }
  if (title.length < 2) {
    return { ok: false, error: "Eğitim başlığı en az 2 karakter olmalıdır." };
  }
  if (!video_url) {
    return { ok: false, error: "Video URL gerekli." };
  }
  try {
    const u = new URL(video_url);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { ok: false, error: "Geçerli bir http(s) adresi girin." };
    }
  } catch {
    return { ok: false, error: "Geçerli bir URL girin." };
  }

  const supabase = await createClient();
  const { user, profile } = await assertUzmanOrAdmin(supabase);

  if (!user || !profile || (profile.role !== "UZMAN" && profile.role !== "ADMIN")) {
    return { ok: false, error: "Bu işlem için yetkiniz yok." };
  }

  const specialist =
    specialist_name.length > 0
      ? specialist_name
      : profile.full_name?.trim() || "Uzman";

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      video_url,
      specialist_name: specialist,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true, error: null };
}

export async function deleteCourse(courseId: string): Promise<CourseMutationState> {
  if (!courseId) {
    return { ok: false, error: "Eğitim seçilemedi." };
  }

  const supabase = await createClient();
  const { user, profile } = await assertUzmanOrAdmin(supabase);

  if (!user || !profile || (profile.role !== "UZMAN" && profile.role !== "ADMIN")) {
    return { ok: false, error: "Bu işlem için yetkiniz yok." };
  }

  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true, error: null };
}
