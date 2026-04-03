"use server";

import { revalidatePath } from "next/cache";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { createClient } from "@/lib/supabase/server";

export type CreateCompanyState = {
  ok: boolean;
  error: string | null;
  company: { name: string; invite_code: string } | null;
};

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSuffix(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

function normalizeInviteCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

async function inviteCodeAvailable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string
): Promise<boolean> {
  const { data } = await supabase
    .from("companies")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();
  return !data;
}

export async function createCompany(
  _prev: CreateCompanyState,
  formData: FormData
): Promise<CreateCompanyState> {
  const name = String(formData.get("name") ?? "").trim();
  let inviteRaw = String(formData.get("invite_code") ?? "");

  if (name.length < 2) {
    return { ok: false, error: "Şirket adı en az 2 karakter olmalıdır.", company: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Oturum bulunamadı.", company: null };
  }

  const profile = await loadMyProfile(supabase);

  if (
    !profile ||
    (profile.role !== "UZMAN" && profile.role !== "ADMIN")
  ) {
    return { ok: false, error: "Bu işlem için yetkiniz yok.", company: null };
  }

  let invite_code = normalizeInviteCode(inviteRaw);

  if (!invite_code) {
    let found = "";
    for (let i = 0; i < 25; i++) {
      const candidate = `KLR-${randomSuffix(5)}`;
      if (await inviteCodeAvailable(supabase, candidate)) {
        found = candidate;
        break;
      }
    }
    if (!found) {
      return {
        ok: false,
        error: "Benzersiz davet kodu üretilemedi. Tekrar deneyin.",
        company: null,
      };
    }
    invite_code = found;
  } else {
    if (invite_code.length < 6 || invite_code.length > 16) {
      return {
        ok: false,
        error: "Davet kodu 6–16 karakter arasında olmalıdır.",
        company: null,
      };
    }
    if (!(await inviteCodeAvailable(supabase, invite_code))) {
      return {
        ok: false,
        error: "Bu davet kodu zaten kullanılıyor. Başka bir kod deneyin.",
        company: null,
      };
    }
  }

  const { data: row, error } = await supabase
    .from("companies")
    .insert({
      name,
      invite_code,
      created_by: user.id,
    })
    .select("name, invite_code")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Bu davet kodu zaten kullanılıyor.",
        company: null,
      };
    }
    return { ok: false, error: error.message, company: null };
  }

  revalidatePath("/dashboard");
  return {
    ok: true,
    error: null,
    company: row
      ? { name: row.name, invite_code: row.invite_code }
      : null,
  };
}
