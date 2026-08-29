import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import {
  getUserOrganizations,
  getOrCreateDefaultOrg,
  pickActiveOrganization,
  activatePendingInvites,
} from "@/services/queries/organizations";
import type { OrgRole } from "@/types/database";

export const ACTIVE_ORG_COOKIE = "active_org_id";

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

/**
 * Server-only helper for the Business module (Team/Agency CRM + ERP): verifies
 * the signed-in user is an active member of `organizationId` before any
 * org-scoped query/action runs. RLS (`is_org_member()`/`has_org_role()` in
 * migration 20260819000001) is the real enforcement boundary — this is
 * defense in depth plus a clean redirect instead of a confusing empty
 * result when someone hits a stale or tampered org id.
 */
export async function requireOrgMember(organizationId: string) {
  const { supabase, user } = await requireUser();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    redirect("/business");
  }

  return { supabase, user, role: membership.role as OrgRole };
}

/**
 * Entry point for every Business-module page/action that doesn't already
 * have an explicit organization id in scope: resolves the org a user should
 * land on (auto-provisioning a default one on their first visit, exactly
 * like getOrCreateProfile self-heals a missing personal profile row), then
 * picks their active org from the `active_org_id` cookie set by the org
 * switcher, falling back to the org they own or the first they joined.
 */
export async function requireActiveOrg() {
  const { supabase, user } = await requireUser();

  await activatePendingInvites(supabase, user.id, user.email);

  let orgs = await getUserOrganizations(supabase, user.id);
  if (orgs.length === 0) {
    const displayName = (user.user_metadata?.full_name as string | undefined) || user.email?.split("@")[0] || "My";
    orgs = [await getOrCreateDefaultOrg(supabase, user.id, displayName)];
  }

  const cookieStore = await cookies();
  const active = pickActiveOrganization(orgs, cookieStore.get(ACTIVE_ORG_COOKIE)?.value);

  return { supabase, user, organization: active.organization, role: active.role, organizations: orgs };
}
