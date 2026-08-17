import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server-only helper for Server Components/Actions: returns the signed-in user or redirects to /login.
 *
 * Uses `getSession()` (verifies the JWT locally from the cookie) rather than
 * `getUser()` (which round-trips to the Supabase Auth server) — `proxy.ts` /
 * `lib/supabase/middleware.ts` already runs `getUser()`'s network check and
 * redirects unauthenticated requests before they ever reach a page, so
 * re-verifying here on every navigation would just double the auth latency
 * without adding any protection.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return { supabase, user: session.user };
}
