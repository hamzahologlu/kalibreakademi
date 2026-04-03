"use server";

import { revalidatePath } from "next/cache";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { createClient } from "@/lib/supabase/server";

export type CreateCourseState = {
  ok: boolean;
  error: string | null;
};

export async function createCourse(
  _prev: CreateCourseState,
  formData: FormData
): Promise<CreateCourseState> {
  const title = String(formData.get("title") ?? "").trim();
  const video_url = String(formData.get("video_url") ?? "").trim();
  const specialist_name = String(formData.get("specialist_name") ?? "").trim();

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Oturum bulunamadı." };
  }

  const profile = await loadMyProfile(supabase);

  if (
    !profile ||
    (profile.role !== "UZMAN" && profile.role !== "ADMIN")
  ) {
    return { ok: false, error: "Bu işlem için yetkiniz yok." };
  }

  const specialist =
    specialist_name.length > 0
      ? specialist_name
      : profile.full_name?.trim() || "Uzman";

  const { error } = await supabase.from("courses").insert({
    title,
    video_url,
    specialist_name: specialist,
    created_by: user.id,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true, error: null };
}
