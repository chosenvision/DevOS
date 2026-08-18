import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { requireUser } from "@/services/auth";
import { exchangeCodeForTokens, fetchGoogleUserInfo } from "@/lib/google/oauth";
import { encryptToken } from "@/lib/crypto/token-encryption";

export async function GET(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  // Collect the outcome first, redirect once at the end — redirect() throws
  // internally, so calling it from inside the try/catch below would get
  // swallowed by the catch block and reported as a generic error instead.
  let target = "/settings/integrations?connected=google";

  if (oauthError) {
    target = `/settings/integrations?error=${encodeURIComponent("Google sign-in was cancelled or denied.")}`;
  } else if (!code || !state || !expectedState || state !== expectedState) {
    target = `/settings/integrations?error=${encodeURIComponent("Google sign-in failed a security check — please try again.")}`;
  } else {
    try {
      const tokens = await exchangeCodeForTokens(code, origin);

      if (!tokens.refresh_token) {
        target = `/settings/integrations?error=${encodeURIComponent(
          "Google didn't return offline access this time. In your Google Account's connected-apps settings, remove DevOS's existing access, then reconnect here."
        )}`;
      } else {
        const userInfo = await fetchGoogleUserInfo(tokens.access_token);
        const grantedScopes = tokens.scope.split(" ").filter(Boolean);

        const { error } = await supabase.from("google_connections").upsert(
          {
            user_id: user.id,
            google_email: userInfo.email,
            google_name: userInfo.name ?? null,
            avatar_url: userInfo.picture ?? null,
            encrypted_refresh_token: encryptToken(tokens.refresh_token),
            granted_scopes: grantedScopes,
            gmail_connected: grantedScopes.some((s) => s.includes("gmail")),
            calendar_connected: grantedScopes.some((s) => s.includes("calendar")),
            connected_at: new Date().toISOString(),
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        if (error) {
          target = `/settings/integrations?error=${encodeURIComponent(error.message)}`;
        }
      }
    } catch (err) {
      console.error("Google OAuth callback error:", err);
      target = `/settings/integrations?error=${encodeURIComponent("Something went wrong connecting Google — please try again.")}`;
    }
  }

  redirect(target);
}
