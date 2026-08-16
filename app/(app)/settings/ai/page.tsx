import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { AiForm } from "@/components/settings/ai-form";
import type { UserPreferences } from "@/types/database";

export const metadata: Metadata = { title: "AI — DevOS" };

export default async function AiSettingsPage() {
  const { supabase, user } = await requireUser();
  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single();

  return <AiForm preferences={preferences as UserPreferences} />;
}
