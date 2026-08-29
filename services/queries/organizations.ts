import type { SupabaseClient } from "@supabase/supabase-js";

import { slugify } from "@/lib/utils";
import type { Organization, OrganizationMember, OrganizationMemberWithProfile, OrgRole } from "@/types/database";

export interface OrgMembership {
  organization: Organization;
  role: OrgRole;
}

/** Every org the user is an *active* member of, with their role in each. */
export async function getUserOrganizations(supabase: SupabaseClient, userId: string): Promise<OrgMembership[]> {
  const { data } = await supabase
    .from("organization_members")
    .select("role, organizations(*)")
    .eq("user_id", userId)
    .eq("status", "active");

  return (data ?? [])
    .filter((row) => row.organizations)
    .map((row) => ({
      organization: row.organizations as unknown as Organization,
      role: row.role as OrgRole,
    }));
}

async function uniqueOrgSlug(supabase: SupabaseClient, name: string): Promise<string> {
  const base = slugify(name) || "business";
  let slug = base;
  let attempt = 0;

  while (attempt < 25) {
    const { data } = await supabase.from("organizations").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }

  return `${base}-${Date.now()}`;
}

/**
 * Self-heals a user with zero organizations by provisioning a default one,
 * mirroring services/queries/profile.ts's getOrCreateProfile — a solo
 * freelancer should land on a working Business overview immediately, not
 * an empty "create an organization" wall.
 */
export async function getOrCreateDefaultOrg(
  supabase: SupabaseClient,
  userId: string,
  displayName: string
): Promise<OrgMembership> {
  const existing = await getUserOrganizations(supabase, userId);
  if (existing.length > 0) return existing[0];

  const name = `${displayName}'s Business`;
  const slug = await uniqueOrgSlug(supabase, name);

  // The organizations INSERT policy checks owner_id = auth.uid(), evaluated
  // by Postgres against the JWT actually forwarded on this request — not
  // against whatever `userId` this function was called with. requireUser()
  // deliberately uses the cheap, locally-decoded getSession() (see its own
  // comment), which is fine for reads but has caused exactly this insert to
  // be rejected with "auth.uid() didn't match" while reads quietly returned
  // empty results instead of erroring. Re-verify with getUser() (a real
  // round-trip to the Auth server) right before the one INSERT here that
  // actually depends on auth.uid() matching a specific value.
  const {
    data: { user: verifiedUser },
    error: verifyError,
  } = await supabase.auth.getUser();

  if (verifyError || !verifiedUser) {
    throw new Error(`Could not verify your session to create an organization: ${verifyError?.message ?? "no user"}`);
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, slug, owner_id: verifiedUser.id })
    .select("*")
    .single();

  if (orgError || !org) {
    const detail = [orgError?.code, orgError?.message, orgError?.details, orgError?.hint]
      .filter(Boolean)
      .join(" | ");
    // Temporary diagnostic: debug_whoami() is a `security invoker` SQL
    // function returning auth.uid() as Postgres sees it for this exact
    // request, compared against the id supabase-js's own getUser() just
    // verified — this pins down whether the two actually match. Remove
    // once resolved (see services/queries/organizations.ts history).
    const { data: whoami, error: whoamiError } = await supabase.rpc("debug_whoami");
    throw new Error(
      `Could not create your organization: ${detail || "unknown error"} ` +
        `[app user=${verifiedUser.id} db auth.uid()=${whoami ?? "null"}${whoamiError ? ` (rpc error: ${whoamiError.message})` : ""}]`
    );
  }

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: verifiedUser.id,
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString(),
  });

  if (memberError) {
    throw new Error(`Could not set up your organization membership: ${memberError.message}`);
  }

  return { organization: org as Organization, role: "owner" };
}

/**
 * Resolves which org a Business-module page/action should operate on for a
 * user who may belong to several: the one they explicitly switched to
 * (`preferredOrgId`, from the `active_org_id` cookie), else the one they
 * own, else the first they joined. Callers are expected to have already
 * ensured `orgs` is non-empty (see requireActiveOrg in services/auth.ts).
 */
export function pickActiveOrganization(orgs: OrgMembership[], preferredOrgId: string | undefined): OrgMembership {
  const preferred = preferredOrgId && orgs.find((o) => o.organization.id === preferredOrgId);
  return preferred || orgs.find((o) => o.role === "owner") || orgs[0];
}

/** Full roster: active members + pending invites, enriched with profile info where known. */
export async function getOrgMembers(
  supabase: SupabaseClient,
  organizationId: string
): Promise<OrganizationMemberWithProfile[]> {
  const { data: members } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  const rows = (members ?? []) as OrganizationMember[];
  const userIds = rows.map((m) => m.user_id).filter((id): id is string => Boolean(id));

  if (userIds.length === 0) {
    return rows.map((m) => ({ ...m, profile: null }));
  }

  const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return rows.map((m) => ({
    ...m,
    profile: m.user_id ? (profileById.get(m.user_id) ?? null) : null,
  }));
}

/**
 * Activates any pending invites matching the signed-in user's email — called
 * once at the top of the Business module layout, same self-healing pattern
 * as getOrCreateProfile: a user invited before they had an account (or
 * logging in for the first time since being invited) shouldn't need a
 * separate "accept invite" click, just to see the org appear on next load.
 */
export async function activatePendingInvites(supabase: SupabaseClient, userId: string, email: string | undefined) {
  if (!email) return;

  await supabase
    .from("organization_members")
    .update({ user_id: userId, status: "active", joined_at: new Date().toISOString() })
    .eq("invited_email", email)
    .eq("status", "invited");
}
