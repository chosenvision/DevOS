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

      redirect(next);
    }
  }

  redirect("/login?error=Could not sign in. Please try again.");
}
