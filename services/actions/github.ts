"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";

export async function disconnectGithub() {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("github_connections").delete().eq("user_id", user.id);

  revalidatePath("/settings/integrations");
  return { error: error?.message };
}
