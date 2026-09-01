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

  const {
    data: { user: verifiedUser },
    error: verifyError,
  } = await supabase.auth.getUser();

  if (verifyError || !verifiedUser) {
    throw new Error(`Could not verify your session to create an organization: ${verifyError?.message ?? "no user"}`);
  }

  const name = `${displayName}'s Business`;
  const slug = await uniqueOrgSlug(supabase, name);
  // Generated here rather than left to the column's gen_random_uuid()
  // default so we have it without asking Postgres to hand the row back
  // (see the comment on the insert below for why that matters).
  const id = crypto.randomUUID();

  // No .select() here on purpose. Chaining one turns this into an
  // `INSERT ... RETURNING *`, and RETURNING under RLS re-checks the
  // table's SELECT policies on the row before handing it back — not just
  // the INSERT policy that already passed. organizations' SELECT policies
  // (is_org_member(), the invited-by-email one) both require an
  // organization_members row that can't exist yet for a brand-new org, so
  // that re-check always fails and Postgres reports it with the exact same
  // "violates row-level security policy" wording as a rejected INSERT —
  // which is what made this look like a WITH CHECK failure until traced
  // down. Insert without asking for the row back, then build the
  // OrgMembership from values we already have.
  const { error: orgError } = await supabase.from("organizations").insert({ id, name, slug, owner_id: verifiedUser.id });

  if (orgError) {
    throw new Error(`Could not create your organization: ${orgError.message}`);
  }

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: id,
    user_id: verifiedUser.id,
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString(),
  });

  if (memberError) {
    throw new Error(`Could not set up your organization membership: ${memberError.message}`);
  }

  const now = new Date().toISOString();
  const organization: Organization = { id, name, slug, owner_id: verifiedUser.id, plan: "free", created_at: now, updated_at: now };

  return { organization, role: "owner" };
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
