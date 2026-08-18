import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getOrCreateUserPreferences } from "@/services/queries/profile";
import { NotificationsForm } from "@/components/settings/notifications-form";

export const metadata: Metadata = { title: "Notifications — DevOS" };

export default async function NotificationsSettingsPage() {
  const { supabase, user } = await requireUser();
  const preferences = await getOrCreateUserPreferences(supabase, user.id);

  return <NotificationsForm preferences={preferences} />;
}
