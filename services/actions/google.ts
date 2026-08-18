"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { decryptToken } from "@/lib/crypto/token-encryption";
import { revokeGoogleToken } from "@/lib/google/oauth";

export async function disconnectGoogle() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("google_connections")
    .select("encrypted_refresh_token")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data) {
    try {
      await revokeGoogleToken(decryptToken(data.encrypted_refresh_token));
    } catch {
      // Best-effort — the local connection record is still removed below.
    }
  }

  const { error } = await supabase.from("google_connections").delete().eq("user_id", user.id);

  revalidatePath("/settings/integrations");
  return { error: error?.message };
}
