import type { SupabaseClient } from "@supabase/supabase-js";

function rpcLikelyMissing(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = error.message ?? "";
  if (msg.includes("get_my_company_name")) return true;
  if (error.code === "42883" || error.code === "PGRST202") return true;
  return false;
}

/**
 * Personel paneli şirket adı. Önce get_my_company_name RPC (RLS'den bağımsız),
 * yoksa companies üzerinden SELECT.
 */
export async function loadMyCompanyName(
  supabase: SupabaseClient,
  companyId: string | null
): Promise<string | null> {
  const { data: rpcData, error: rpcError } =
    await supabase.rpc("get_my_company_name");

  if (!rpcError && typeof rpcData === "string" && rpcData.trim().length > 0) {
    return rpcData.trim();
  }

  if (rpcError && !rpcLikelyMissing(rpcError)) {
    console.error("[loadMyCompanyName] rpc", rpcError.message);
  }

  if (!companyId) {
    return null;
  }

  const { data: row, error: selError } = await supabase
    .from("companies")
    .select("name")
    .eq("id", companyId)
    .maybeSingle();

  if (selError) {
    console.error("[loadMyCompanyName] select", selError.message);
    return null;
  }

  return row?.name?.trim() ?? null;
}
