import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { GithubConnect } from "@/components/settings/github-connect";
import type { GithubConnection } from "@/types/database";

export const metadata: Metadata = { title: "Integrations — DevOS" };

export default async function IntegrationsSettingsPage() {
  const { supabase, user } = await requireUser();
  const { data: connection } = await supabase
    .from("github_connections")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return <GithubConnect connection={connection as GithubConnection | null} />;
}
