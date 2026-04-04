"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function clientMeta() {
  const h = await headers();
  const ua = h.get("user-agent")?.slice(0, 500) ?? null;
  const fwd = h.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim()?.slice(0, 64) ?? null;
  return { ua, ip };
}

/** Başarılı giriş / kayıt sonrası çağrılır (oturum çerezde). */
export async function recordAuthSignIn(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { ua, ip } = await clientMeta();
  const { error } = await supabase.from("auth_activity_log").insert({
    user_id: user.id,
    event_type: "sign_in",
    user_agent: ua,
    ip_address: ip,
  });
  if (error) {
    console.warn("[recordAuthSignIn]", error.message);
  }
}

/** Çıkıştan hemen önce çağrılır. */
export async function recordAuthSignOut(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { ua, ip } = await clientMeta();
  await supabase.from("auth_activity_log").insert({
    user_id: user.id,
    event_type: "sign_out",
    user_agent: ua,
    ip_address: ip,
  });
}
