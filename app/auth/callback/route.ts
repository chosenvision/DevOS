import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

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
        await supabase.from("github_connections").upsert(
          {
            user_id: data.user!.id,
            github_username: (identityData.user_name as string) ?? (identityData.preferred_username as string) ?? "unknown",
            avatar_url: (identityData.avatar_url as string) ?? null,
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
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
