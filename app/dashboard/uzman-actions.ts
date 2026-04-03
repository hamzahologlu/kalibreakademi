"use server";

import { revalidatePath } from "next/cache";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { createClient } from "@/lib/supabase/server";

export type AssignCourseState = {
  ok: boolean;
  error: string | null;
};

export async function assignCourseToCompany(
  _prev: AssignCourseState,
  formData: FormData
): Promise<AssignCourseState> {
  const courseId = String(formData.get("course_id") ?? "").trim();
  const companyId = String(formData.get("company_id") ?? "").trim();

  if (!courseId || !companyId) {
    return { ok: false, error: "Eksik bilgi." };
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

  const { error } = await supabase.from("course_assignments").insert({
    course_id: courseId,
    company_id: companyId,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Bu şirket bu eğitime zaten atanmış." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true, error: null };
}

export async function unassignCourseFromCompany(
  courseId: string,
  companyId: string
): Promise<AssignCourseState> {
  if (!courseId || !companyId) {
    return { ok: false, error: "Eksik bilgi." };
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

  const { error, count } = await supabase
    .from("course_assignments")
    .delete({ count: "exact" })
    .eq("course_id", courseId)
    .eq("company_id", companyId);

  if (error) {
    return { ok: false, error: error.message };
  }

  if (count === 0) {
    return { ok: false, error: "Bu atama bulunamadı veya zaten kaldırılmış." };
  }

  revalidatePath("/dashboard");
  return { ok: true, error: null };
}
