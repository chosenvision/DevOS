import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getOrCreateUserPreferences } from "@/services/queries/profile";
import { AiForm } from "@/components/settings/ai-form";

export const metadata: Metadata = { title: "AI — DevOS" };

export default async function AiSettingsPage() {
  const { supabase, user } = await requireUser();
  const preferences = await getOrCreateUserPreferences(supabase, user.id);

  return <AiForm preferences={preferences} />;
}
