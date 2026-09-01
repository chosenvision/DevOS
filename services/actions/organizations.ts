"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { requireUser, requireOrgMember, ACTIVE_ORG_COOKIE } from "@/services/auth";
import { createOrganizationSchema, inviteMemberSchema } from "@/lib/validations/organization";
import { slugify } from "@/lib/utils";

export type ActionState = { error?: string; success?: string };

async function uniqueOrgSlug(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], name: string) {
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

/** Creates an additional organization beyond the auto-provisioned default (e.g. a second business). */
export async function createOrganization(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = createOrganizationSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const slug = await uniqueOrgSlug(supabase, parsed.data.name);
  const id = crypto.randomUUID();

  // No .select() on this insert — see the matching comment in
  // services/queries/organizations.ts:getOrCreateDefaultOrg. Chaining one
  // turns this into INSERT ... RETURNING, which re-checks organizations'
  // SELECT policies on the new row; those require an organization_members
  // row that doesn't exist until the insert right below this one, so the
  // RETURNING re-check fails RLS even though the INSERT itself is allowed.
  const { error: orgError } = await supabase
    .from("organizations")
    .insert({ id, name: parsed.data.name, slug, owner_id: user.id });

  if (orgError) {
    return { error: orgError.message };
  }

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: id,
    user_id: user.id,
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString(),
  });

  if (memberError) {
    return { error: memberError.message };
  }

  revalidatePath("/business");
  return { success: `Created "${parsed.data.name}".` };
}

/** Switches which org Business-module pages resolve to (see requireActiveOrg). */
export async function setActiveOrganization(organizationId: string): Promise<ActionState> {
  await requireOrgMember(organizationId);

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    // Not httpOnly: the org switcher UI reads this client-side to show which
    // org is active. It's just an org id the user is already a verified
    // member of (requireOrgMember above), not a secret — RLS is the actual
    // access boundary regardless of what this cookie says.
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/business");
  return { success: "Switched organization." };
}

export async function inviteMember(organizationId: string, formData: FormData): Promise<ActionState> {
  const { supabase, role } = await requireOrgMember(organizationId);

  if (role === "member") {
    return { error: "Only owners and admins can invite teammates." };
  }

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") || "member",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("organization_members").insert({
    organization_id: organizationId,
    invited_email: parsed.data.email,
    role: parsed.data.role,
    status: "invited",
    invited_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: `${parsed.data.email} is already invited or a member.` };
    }
    return { error: error.message };
  }

  revalidatePath("/business/team");
  return { success: `Invited ${parsed.data.email}.` };
}

export async function updateMemberRole(organizationId: string, memberId: string, newRole: "admin" | "member"): Promise<ActionState> {
  const { supabase, role } = await requireOrgMember(organizationId);

  if (role !== "owner") {
    return { error: "Only the owner can change member roles." };
  }

  const { error } = await supabase
    .from("organization_members")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/business/team");
  return { success: "Role updated." };
}

export async function removeMember(organizationId: string, memberId: string): Promise<ActionState> {
  const { supabase, role, user } = await requireOrgMember(organizationId);

  if (role === "member") {
    return { error: "Only owners and admins can remove teammates." };
  }

  const { data: target } = await supabase
    .from("organization_members")
    .select("role, user_id")
    .eq("id", memberId)
    .eq("organization_id", organizationId)
    .single();

  if (target?.role === "owner") {
    return { error: "The organization owner can't be removed." };
  }
  if (target?.user_id === user.id) {
    return { error: "Use \"Leave organization\" to remove yourself." };
  }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/business/team");
  return { success: "Removed." };
}

export async function leaveOrganization(organizationId: string): Promise<ActionState> {
  const { supabase, user, role } = await requireOrgMember(organizationId);

  if (role === "owner") {
    return { error: "Transfer ownership to another member before leaving." };
  }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/business");
  return { success: "You left the organization." };
}
