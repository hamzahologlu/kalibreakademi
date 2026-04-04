"use server";

import { recordAuthSignOut } from "@/app/auth/log-activity-action";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  await recordAuthSignOut();
  await supabase.auth.signOut();
  redirect("/");
}
