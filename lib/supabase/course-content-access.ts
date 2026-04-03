/**
 * Next.js uygulama kodu — Supabase SQL Editor’da ÇALIŞTIRMAYIN.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MyProfileRow } from "@/lib/supabase/load-my-profile";

/**
 * /egitim ve /sinav: personel şirket ataması veya kendi oluşturduğu kurs (uzman/admin).
 */
export async function userHasCourseContentAccess(
  supabase: SupabaseClient,
  userId: string,
  profile: MyProfileRow,
  course: { id: string; created_by: string | null }
): Promise<boolean> {
  const role = profile.role.toUpperCase();
  if (role === "UZMAN" || role === "ADMIN") {
    return course.created_by != null && course.created_by === userId;
  }
  if (!profile.company_id) {
    return false;
  }
  const { data } = await supabase
    .from("course_assignments")
    .select("id")
    .eq("course_id", course.id)
    .eq("company_id", profile.company_id)
    .maybeSingle();
  return Boolean(data);
}
