import type { SupabaseClient } from "@supabase/supabase-js";

import { decryptToken } from "@/lib/crypto/token-encryption";
import { refreshGoogleAccessToken } from "@/lib/google/oauth";

/**
 * Exchanges the stored (encrypted) refresh token for a fresh short-lived
 * access token, on demand. No access token is ever persisted — only the
 * refresh token, encrypted, so there's nothing long-lived to leak beyond
 * that one value. Returns null if there's no connection to use.
 *
 * This is the foundation the Career Inbox and Scheduling Assistant call
 * before making any Gmail/Calendar API request — those aren't built yet
 * (see ARCHITECTURE.md), but this is where they'll plug in.
 */
export async function getValidGoogleAccessToken(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("google_connections")
    .select("encrypted_refresh_token")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;

  const refreshToken = decryptToken(data.encrypted_refresh_token);
  const { access_token } = await refreshGoogleAccessToken(refreshToken);
  return access_token;
}
