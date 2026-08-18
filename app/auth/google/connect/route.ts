import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { requireUser } from "@/services/auth";
import { getGoogleAuthUrl } from "@/lib/google/oauth";

/** Starts the Google OAuth flow for Gmail + Calendar access. Requires an existing DevOS session — this links an identity, it isn't itself a sign-in. */
export async function GET(request: NextRequest) {
  await requireUser();

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    redirect(
      `/settings/integrations?error=${encodeURIComponent(
        "Google isn't configured on this deployment yet — add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first."
      )}`
    );
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const origin = new URL(request.url).origin;
  redirect(getGoogleAuthUrl(origin, state));
}
