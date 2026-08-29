"use server";

import { revalidatePath } from "next/cache";

import { requireOrgMember } from "@/services/auth";
import { crmClientSchema, crmContactSchema, crmDealSchema, crmActivitySchema } from "@/lib/validations/crm";

export type ActionState = { error?: string; success?: string };

function orNull(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

// ---------- Clients ----------

export async function createCrmClient(organizationId: string, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireOrgMember(organizationId);

  const parsed = crmClientSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry") || undefined,
    website: formData.get("website") || undefined,
    status: formData.get("status") || "active",
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("crm_clients").insert({
    organization_id: organizationId,
    name: parsed.data.name,
    industry: orNull(parsed.data.industry),
    website: orNull(parsed.data.website),
    status: parsed.data.status,
    notes: orNull(parsed.data.notes),
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/business/clients");
  revalidatePath("/business");
  return { success: "Client added." };
}

export async function updateCrmClient(organizationId: string, clientId: string, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const parsed = crmClientSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry") || undefined,
    website: formData.get("website") || undefined,
    status: formData.get("status") || "active",
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("crm_clients")
    .update({
      name: parsed.data.name,
      industry: orNull(parsed.data.industry),
      website: orNull(parsed.data.website),
      status: parsed.data.status,
      notes: orNull(parsed.data.notes),
    })
    .eq("id", clientId)
    .eq("organization_id", organizationId);

  if (error) return { error: error.message };

  revalidatePath(`/business/clients/${clientId}`);
  revalidatePath("/business/clients");
  return { success: "Client updated." };
}

export async function deleteCrmClient(organizationId: string, clientId: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase.from("crm_clients").delete().eq("id", clientId).eq("organization_id", organizationId);
  if (error) return { error: error.message };

  revalidatePath("/business/clients");
  revalidatePath("/business");
  return { success: "Client removed." };
}

// ---------- Contacts ----------

export async function createCrmContact(organizationId: string, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const parsed = crmContactSchema.safeParse({
    clientId: formData.get("clientId") || undefined,
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    role: formData.get("role") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("crm_contacts").insert({
    organization_id: organizationId,
    client_id: orNull(parsed.data.clientId),
    name: parsed.data.name,
    email: orNull(parsed.data.email),
    phone: orNull(parsed.data.phone),
    role: orNull(parsed.data.role),
    notes: orNull(parsed.data.notes),
  });

  if (error) return { error: error.message };

  revalidatePath("/business/clients");
  return { success: "Contact added." };
}

export async function deleteCrmContact(organizationId: string, contactId: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase.from("crm_contacts").delete().eq("id", contactId).eq("organization_id", organizationId);
  if (error) return { error: error.message };

  revalidatePath("/business/clients");
  return { success: "Contact removed." };
}

// ---------- Deals ----------

export async function createCrmDeal(organizationId: string, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const parsed = crmDealSchema.safeParse({
    clientId: formData.get("clientId") || undefined,
    title: formData.get("title"),
    value: formData.get("value") || 0,
    currency: formData.get("currency") || "USD",
    stage: formData.get("stage") || "lead",
    ownerId: formData.get("ownerId") || undefined,
    expectedCloseDate: formData.get("expectedCloseDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("crm_deals").insert({
    organization_id: organizationId,
    client_id: orNull(parsed.data.clientId),
    title: parsed.data.title,
    value: parsed.data.value,
    currency: parsed.data.currency,
    stage: parsed.data.stage,
    owner_id: orNull(parsed.data.ownerId),
    expected_close_date: orNull(parsed.data.expectedCloseDate),
    notes: orNull(parsed.data.notes),
  });

  if (error) return { error: error.message };

  revalidatePath("/business/deals");
  revalidatePath("/business");
  return { success: "Deal added." };
}

export async function updateCrmDealStage(organizationId: string, dealId: string, stage: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase
    .from("crm_deals")
    .update({ stage })
    .eq("id", dealId)
    .eq("organization_id", organizationId);

  if (error) return { error: error.message };

  revalidatePath("/business/deals");
  revalidatePath("/business");
  return { success: "Deal moved." };
}

export async function deleteCrmDeal(organizationId: string, dealId: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase.from("crm_deals").delete().eq("id", dealId).eq("organization_id", organizationId);
  if (error) return { error: error.message };

  revalidatePath("/business/deals");
  revalidatePath("/business");
  return { success: "Deal removed." };
}

// ---------- Activities ----------

export async function createCrmActivity(organizationId: string, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireOrgMember(organizationId);

  const parsed = crmActivitySchema.safeParse({
    clientId: formData.get("clientId"),
    dealId: formData.get("dealId") || undefined,
    type: formData.get("type") || "note",
    description: formData.get("description"),
    occurredAt: formData.get("occurredAt") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("crm_activities").insert({
    organization_id: organizationId,
    client_id: parsed.data.clientId,
    deal_id: orNull(parsed.data.dealId),
    type: parsed.data.type,
    description: parsed.data.description,
    occurred_at: parsed.data.occurredAt || new Date().toISOString(),
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/business/clients");
  revalidatePath("/business");
  return { success: "Activity logged." };
}

export async function deleteCrmActivity(organizationId: string, activityId: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase
    .from("crm_activities")
    .delete()
    .eq("id", activityId)
    .eq("organization_id", organizationId);

  if (error) return { error: error.message };

  revalidatePath("/business/clients");
  return { success: "Activity removed." };
}
