import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { GithubConnect } from "@/components/settings/github-connect";
import { GithubRepoList } from "@/components/settings/github-repo-list";
import { LinkedinConnect } from "@/components/settings/linkedin-connect";
import { GoogleConnect, type GoogleConnectionSummary } from "@/components/settings/google-connect";
import type { GithubConnection, GithubRepo, LinkedinConnection } from "@/types/database";

export const metadata: Metadata = { title: "Integrations — DevOS" };

export default async function IntegrationsSettingsPage({ searchParams }: PageProps<"/settings/integrations">) {
  const { supabase, user } = await requireUser();
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const connected = typeof params.connected === "string" ? params.connected : undefined;

  const [{ data: githubConnection }, { data: githubRepos }, { data: linkedinConnection }, { data: googleConnection }] =
    await Promise.all([
      supabase.from("github_connections").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("github_repos")
        .select("*")
        .eq("user_id", user.id)
        .order("synced_at", { ascending: false })
        .limit(20),
      supabase.from("linkedin_connections").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("google_connections")
        .select("google_email, google_name, avatar_url, gmail_connected, calendar_connected")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {connected && !error && (
        <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-[oklch(0.4_0.12_155)] dark:text-success">
          Connected successfully.
        </p>
      )}

      <GithubConnect connection={githubConnection as GithubConnection | null} />
      <GithubRepoList repos={(githubRepos as GithubRepo[]) ?? []} />
      <LinkedinConnect connection={linkedinConnection as LinkedinConnection | null} />
      <GoogleConnect
        connection={googleConnection as GoogleConnectionSummary | null}
        configured={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
      />
    </div>
  );
}
