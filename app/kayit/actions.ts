"use server";

import {
  isValidTcKimlikNo,
  normalizePhoneDigits,
  normalizeTcKimlikNo,
  validateWorkerPhoneDigits,
  workerSyntheticEmail,
} from "@/lib/auth-worker";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type RegisterState = {
  error: string | null;
};

/** Sadece bu iki değer metadata’ya yazılır; ADMIN asla üretilmez. */
const REG_WORKER = "worker" as const;
const REG_UZMAN = "uzman" as const;

/**
 * Personel — firma kodu + WORKER (tetikleyici profiles oluşturur).
 */
export async function registerWorker(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const full_name = String(formData.get("full_name") ?? "").trim();
  const tcRaw = String(formData.get("tc_kimlik_no") ?? "");
  const phoneRaw = String(formData.get("phone") ?? "");
  const invite_code = String(formData.get("invite_code") ?? "").trim();

  const tcDigits = normalizeTcKimlikNo(tcRaw);
  const phoneDigits = normalizePhoneDigits(phoneRaw);

  if (full_name.length < 2) {
    return { error: "Ad Soyad en az 2 karakter olmalıdır." };
  }
  if (!isValidTcKimlikNo(tcDigits)) {
    return {
      error:
        "Geçerli bir T.C. Kimlik Numarası girin (11 hane, kontrol rakamları doğru olmalı).",
    };
  }
  const phoneErr = validateWorkerPhoneDigits(phoneDigits);
  if (phoneErr) {
    return { error: phoneErr };
  }
  if (!invite_code) {
    return { error: "Firma kodu gerekli." };
  }

  const authEmail = workerSyntheticEmail(tcDigits);
  const password = phoneDigits;

  const supabase = await createClient();

  const { data: companyRow, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("invite_code", invite_code)
    .maybeSingle();

  if (companyError) {
    return {
      error:
        "Firma kodu kontrol edilemedi. `rls-companies-select.sql` politikasını kontrol edin.",
    };
  }

  if (!companyRow?.id) {
    return { error: "Hatalı firma kodu" };
  }

  const companyId = companyRow.id;

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: authEmail,
    password,
    options: {
      data: {
        full_name,
        company_id: companyId,
        reg_type: REG_WORKER,
        tc_kimlik_no: tcDigits,
        phone: phoneDigits,
      },
    },
  });

  if (signUpError) {
    const m = signUpError.message.toLowerCase();
    if (
      m.includes("already") ||
      m.includes("registered") ||
      m.includes("exists")
    ) {
      return {
        error:
          "Bu T.C. Kimlik Numarası ile zaten kayıt var. Girişte aynı numarayı kullanın.",
      };
    }
    return { error: signUpError.message };
  }

  if (!authData.user) {
    return { error: "Kayıt tamamlanamadı." };
  }

  redirect("/dashboard?kayit=basarili");
}

/**
 * İSG Uzmanı — firma kodu yok, UZMAN + isg_license_number (tetikleyici).
 */
export async function registerUzman(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const isg_license_number = String(
    formData.get("isg_license_number") ?? ""
  ).trim();

  if (full_name.length < 2) {
    return { error: "Ad Soyad en az 2 karakter olmalıdır." };
  }
  if (!email.includes("@")) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }
  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır." };
  }
  if (isg_license_number.length < 3) {
    return { error: "İSG Uzmanlık numarası en az 3 karakter olmalıdır." };
  }

  const supabase = await createClient();

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        reg_type: REG_UZMAN,
        isg_license_number,
      },
    },
  });

  if (signUpError) {
    const m = signUpError.message.toLowerCase();
    if (
      m.includes("already") ||
      m.includes("registered") ||
      m.includes("exists")
    ) {
      return { error: "Bu e-posta ile zaten kayıt var." };
    }
    return { error: signUpError.message };
  }

  if (!authData.user) {
    return { error: "Kayıt tamamlanamadı." };
  }

  redirect("/dashboard?kayit=basarili");
}
