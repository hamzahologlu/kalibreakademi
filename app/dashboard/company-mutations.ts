"use server";

import { revalidatePath } from "next/cache";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { createClient } from "@/lib/supabase/server";
import type { CompanyMutationState } from "./dashboard-mutation-state";

function normalizeInviteCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

async function inviteCodeAvailableForUpdate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string,
  excludeCompanyId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("companies")
    .select("id")
    .eq("invite_code", code)
    .neq("id", excludeCompanyId)
    .maybeSingle();
  return !data;
}

export async function updateCompany(
  _prev: CompanyMutationState,
  formData: FormData
): Promise<CompanyMutationState> {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const inviteRaw = String(formData.get("invite_code") ?? "");

  if (!id) {
    return { ok: false, error: "Şirket bulunamadı." };
  }
  if (name.length < 2) {
    return { ok: false, error: "Şirket adı en az 2 karakter olmalıdır." };
  }

  const invite_code = normalizeInviteCode(inviteRaw);
  if (!invite_code) {
    return { ok: false, error: "Davet kodu gerekli." };
  }
  if (invite_code.length < 6 || invite_code.length > 16) {
    return {
      ok: false,
      error: "Davet kodu 6–16 karakter arasında olmalıdır.",
    };
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

  if (!(await inviteCodeAvailableForUpdate(supabase, invite_code, id))) {
    return {
      ok: false,
      error: "Bu davet kodu zaten kullanılıyor.",
    };
  }

  const { error } = await supabase
    .from("companies")
    .update({ name, invite_code })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Bu davet kodu zaten kullanılıyor." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true, error: null };
}

export async function deleteCompany(companyId: string): Promise<CompanyMutationState> {
  if (!companyId) {
    return { ok: false, error: "Şirket seçilemedi." };
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

  // Tek DELETE: companies satırı silinir; FK ON DELETE CASCADE yalnızca
  // course_assignments’taki bu şirket kayıtlarını kaldırır. courses tablosu
  // ve eğitim içerikleri değişmez. profiles.company_id → SET NULL (personel
  // profili kalır, şirket bağlantısı düşer).
  const { error } = await supabase.from("companies").delete().eq("id", companyId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true, error: null };
}
