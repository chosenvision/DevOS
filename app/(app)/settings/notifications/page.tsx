import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { NotificationsForm } from "@/components/settings/notifications-form";
import type { UserPreferences } from "@/types/database";

export const metadata: Metadata = { title: "Notifications — DevOS" };

export default async function NotificationsSettingsPage() {
  const { supabase, user } = await requireUser();
  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single();

  return <NotificationsForm preferences={preferences as UserPreferences} />;
}
