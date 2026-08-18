import type { SupabaseClient } from "@supabase/supabase-js";

import type { Profile, UserPreferences } from "@/types/database";

/**
 * Self-heals accounts whose `profiles` row is missing. This happens for
 * any account created before the `handle_new_user` trigger existed on
 * its database (e.g. signed up, then ran the migrations afterward) —
 * the trigger only fires on new `auth.users` inserts, never retroactively,
 * so those accounts are otherwise permanently missing this row and every
 * page that assumes it exists (Settings → Profile/AI/Notifications, the
 * app shell) breaks. Mirrors the trigger's own defaults exactly.
 */
export async function getOrCreateProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined
): Promise<Profile> {
  const { data: existing } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (existing) return existing as Profile;

  const { data: created, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, full_name: email?.split("@")[0] ?? null }, { onConflict: "id" })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(`Could not create your profile: ${error?.message ?? "unknown error"}`);
  }
  return created as Profile;
}

/** Same self-healing for `user_preferences` (also provisioned by the same trigger). */
export async function getOrCreateUserPreferences(supabase: SupabaseClient, userId: string): Promise<UserPreferences> {
  const { data: existing } = await supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle();
  if (existing) return existing as UserPreferences;

  const { data: created, error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(`Could not create your preferences: ${error?.message ?? "unknown error"}`);
  }
  return created as UserPreferences;
}
