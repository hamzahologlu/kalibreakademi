/**
 * Personel girişi: Supabase Auth e-posta zorunlu olduğundan sentetik adres kullanılır.
 * Kullanıcı arayüzünde yalnızca T.C. kimlik + telefon gösterilir.
 */
export const WORKER_AUTH_EMAIL_DOMAIN = "kalibre-worker.invalid";

/** T.C. kimlik — yalnızca rakam, 11 hane. */
export function normalizeTcKimlikNo(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 11);
}

/** Telefon — yalnızca rakam (şifre olarak tutulur). */
export function normalizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function workerSyntheticEmail(tcDigits: string): string {
  return `${tcDigits}@${WORKER_AUTH_EMAIL_DOMAIN}`;
}

/**
 * Auth şifresi farklı biçimde kaydedilmiş olabilir (0532… vs 532…).
 * Girişte sırayla denenir; kayıt tarafı değişmeden eski/elle ayarlı hesaplar açılır.
 */
export function workerPhonePasswordVariants(normalizedDigits: string): string[] {
  const d = normalizedDigits;
  const out = new Set<string>();
  out.add(d);
  if (d.length === 11 && d.startsWith("0")) {
    out.add(d.slice(1));
  }
  if (d.length === 10) {
    out.add(`0${d}`);
  }
  return [...out];
}

/**
 * Personel girişi: kayıt sırasında isValidTcKimlikNo kullanılır; girişte checksum
 * şart değildir (veritabanına elle / eski süreçle giren numaralar da oturum açabilsin).
 */
export function isPlausibleWorkerLoginTc(digits: string): boolean {
  if (!/^[1-9]\d{10}$/.test(digits)) {
    return false;
  }
  if (new Set(digits.split("")).size === 1) {
    return false;
  }
  return true;
}

/** Türkiye Cumhuriyeti kimlik no algoritması (11 hane). */
export function isValidTcKimlikNo(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) {
    return false;
  }
  if (digits[0] === "0") {
    return false;
  }
  const d = digits.split("").map((c) => parseInt(c, 10));
  if (new Set(d).size === 1) {
    return false;
  }
  let odd = 0;
  let even = 0;
  for (let i = 0; i < 9; i++) {
    if (i % 2 === 0) {
      odd += d[i];
    } else {
      even += d[i];
    }
  }
  const c10 = (odd * 7 - even) % 10;
  const check10 = (c10 + 10) % 10;
  if (d[9] !== check10) {
    return false;
  }
  const sumFirst10 = d.slice(0, 10).reduce((a, b) => a + b, 0);
  if (d[10] !== sumFirst10 % 10) {
    return false;
  }
  return true;
}

export function validateWorkerPhoneDigits(digits: string): string | null {
  if (digits.length < 10) {
    return "Telefon numarası en az 10 hane olmalıdır.";
  }
  if (digits.length > 15) {
    return "Telefon numarası çok uzun.";
  }
  return null;
}
