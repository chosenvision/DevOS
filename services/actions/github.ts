"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireUser } from "@/services/auth";
import { decryptToken } from "@/lib/crypto/token-encryption";
import { fetchGithubUser, fetchGithubRepos, fetchRecentCommitActivity } from "@/lib/github/api";

export async function disconnectGithub() {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("github_connections").delete().eq("user_id", user.id);

  revalidatePath("/settings/integrations");
  revalidatePath("/dashboard");
  return { error: error?.message };
}

/**
 * Pulls fresh repo + commit-activity data from GitHub using the user's
 * stored token and caches it (github_repos, github_connections.recent_commits)
 * so the Dashboard doesn't hit the GitHub API on every page load. Called
 * right after connecting, and by the manual "Sync now" action below.
 */
export async function syncGithubData(supabase: SupabaseClient, userId: string): Promise<{ error?: string }> {
  const { data: connection } = await supabase
    .from("github_connections")
    .select("access_token_encrypted, github_username")
    .eq("user_id", userId)
    .maybeSingle();

  if (!connection?.access_token_encrypted) {
    return { error: "GitHub isn't connected with repo access yet — reconnect it in Settings → Integrations." };
  }

  let token: string;
  try {
    token = decryptToken(connection.access_token_encrypted);
  } catch {
    return { error: "Your GitHub connection is corrupted — disconnect and reconnect it." };
  }

  try {
    const [githubUser, repos, commitActivity] = await Promise.all([
      fetchGithubUser(token),
      fetchGithubRepos(token),
      fetchRecentCommitActivity(token, connection.github_username),
    ]);

    await supabase.from("github_connections").upsert(
      {
        user_id: userId,
        github_username: githubUser.login,
        avatar_url: githubUser.avatar_url,
        public_repos: githubUser.public_repos,
        followers: githubUser.followers,
        recent_commits: commitActivity,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (repos.length > 0) {
      const { error: reposError } = await supabase.from("github_repos").upsert(
        repos.map((r) => ({
          user_id: userId,
          repo_name: r.repo_name,
          full_name: r.full_name,
          description: r.description,
          stars: r.stars,
          forks: r.forks,
          language: r.language,
          url: r.url,
          synced_at: new Date().toISOString(),
        })),
        { onConflict: "user_id,full_name" }
      );
      if (reposError) return { error: reposError.message };
    }

    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not sync GitHub data." };
  }
}

/** Server Action wrapper for the "Sync now" button. */
export async function syncGithubNow() {
  const { supabase, user } = await requireUser();
  const result = await syncGithubData(supabase, user.id);

  revalidatePath("/settings/integrations");
  revalidatePath("/dashboard");
  return result;
}
