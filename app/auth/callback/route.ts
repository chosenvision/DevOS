import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/crypto/token-encryption";
import { syncGithubData } from "@/services/actions/github";

/** Handles OAuth (PKCE code exchange) callbacks: sign-in and identity linking (e.g. Connect GitHub). */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const githubIdentity = data.user?.identities?.find((i) => i.provider === "github");

      if (githubIdentity) {
        const identityData = githubIdentity.identity_data ?? {};
        // provider_token is the raw GitHub OAuth token — Supabase only
        // returns it on the session from this exact exchange, never
        // persists it itself, so it has to be captured and stored here or
        // it's gone. GitHub OAuth App tokens don't expire, so unlike
        // Google there's no refresh-token dance needed.
        const providerToken = data.session?.provider_token;

        await supabase.from("github_connections").upsert(
          {
            user_id: data.user!.id,
            github_username: (identityData.user_name as string) ?? (identityData.preferred_username as string) ?? "unknown",
            avatar_url: (identityData.avatar_url as string) ?? null,
            ...(providerToken ? { access_token_encrypted: encryptToken(providerToken) } : {}),
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        if (providerToken) {
          // Best-effort: populate repos/commit activity right away so the
          // Dashboard card has real data on the very next load. A failure
          // here shouldn't block sign-in — "Sync now" in Settings covers it.
          await syncGithubData(supabase, data.user!.id).catch((err) =>
            console.error("Initial GitHub sync failed:", err)
          );
        }
      }

      const linkedinIdentity = data.user?.identities?.find((i) => i.provider === "linkedin_oidc");

      if (linkedinIdentity) {
        // LinkedIn's OIDC scope only ever returns standard OpenID claims —
        // name/email/picture. No job data, connections, or profile URL.
        const identityData = linkedinIdentity.identity_data ?? {};
        await supabase.from("linkedin_connections").upsert(
          {
            user_id: data.user!.id,
            linkedin_name: (identityData.name as string) ?? (identityData.email as string) ?? "LinkedIn member",
            linkedin_email: (identityData.email as string) ?? null,
            avatar_url: (identityData.picture as string) ?? null,
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      }

      redirect(next);
    }
  }

  redirect("/login?error=Could not sign in. Please try again.");
}
