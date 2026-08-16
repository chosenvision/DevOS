import type { SupabaseClient } from "@supabase/supabase-js";

/** Lightweight project list for <select> pickers (Quick Add, task forms, etc). */
export async function getProjectOptions(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("projects")
    .select("id, name, slug")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  return data ?? [];
}
