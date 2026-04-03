import type { SupabaseClient } from "@supabase/supabase-js";

export type MyProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  company_id: string | null;
};

function rowFromRpcJson(data: unknown): MyProfileRow | null {
  if (data === null || data === undefined) {
    return null;
  }
  if (typeof data !== "object" || Array.isArray(data)) {
    return null;
  }
  const p = data as Record<string, unknown>;
  if (p.id === null || p.id === undefined) {
    return null;
  }
  return {
    id: String(p.id),
    full_name:
      p.full_name === null || p.full_name === undefined
        ? null
        : String(p.full_name),
    email: String(p.email ?? ""),
    role: String(p.role ?? "WORKER"),
    company_id:
      p.company_id === null || p.company_id === undefined
        ? null
        : String(p.company_id),
  };
}

function rpcMissing(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = error.message ?? "";
  if (msg.includes("get_my_profile_row")) return true;
  if (error.code === "42883" || error.code === "PGRST202") return true;
  return false;
}

/**
 * Oturumdaki kullanıcının profiles satırı.
 * Önce SECURITY DEFINER RPC (RLS’den bağımsız); yoksa veya boşsa doğrudan SELECT.
 * Üretimde `supabase/fix-profiles-select-own-and-rpc.sql` çalıştırın.
 */
export async function loadMyProfile(
  supabase: SupabaseClient
): Promise<MyProfileRow | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: rpcData, error: rpcError } =
    await supabase.rpc("get_my_profile_row");

  const fromRpc = rowFromRpcJson(rpcData);
  if (fromRpc) {
    return fromRpc;
  }

  if (rpcError && !rpcMissing(rpcError)) {
    console.error("[loadMyProfile] rpc", rpcError.message);
  }

  const { data: row, error: selError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (selError) {
    console.error("[loadMyProfile] select", selError.message);
    return null;
  }
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    company_id: row.company_id,
  };
}
