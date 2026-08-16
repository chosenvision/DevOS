"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { companySchema, contactSchema } from "@/lib/validations/company";

export type ActionState = { error?: string; success?: string };

export async function createCompany(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website") || undefined,
    industry: formData.get("industry") || undefined,
    size: formData.get("size") || undefined,
    location: formData.get("location") || undefined,
    careersUrl: formData.get("careersUrl") || undefined,
    notes: formData.get("notes") || undefined,
    cultureNotes: formData.get("cultureNotes") || undefined,
    salaryNotes: formData.get("salaryNotes") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await supabase.from("companies").insert({
    user_id: user.id,
    name: parsed.data.name,
    website: parsed.data.website || null,
    industry: parsed.data.industry || null,
    size: parsed.data.size || null,
    location: parsed.data.location || null,
    careers_url: parsed.data.careersUrl || null,
    notes: parsed.data.notes || null,
    culture_notes: parsed.data.cultureNotes || null,
    salary_notes: parsed.data.salaryNotes || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/career/companies");
  return { success: "Company added." };
}

export async function deleteCompany(companyId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("companies").delete().eq("id", companyId).eq("user_id", user.id);
  revalidatePath("/career/companies");
  return { error: error?.message };
}

export async function createContact(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    companyId: formData.get("companyId") || undefined,
    role: formData.get("role") || undefined,
    linkedinUrl: formData.get("linkedinUrl") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    relationship: formData.get("relationship") || undefined,
    nextFollowUpAt: formData.get("nextFollowUpAt") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await supabase.from("contacts").insert({
    user_id: user.id,
    name: parsed.data.name,
    company_id: parsed.data.companyId || null,
    role: parsed.data.role || null,
    linkedin_url: parsed.data.linkedinUrl || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    relationship: parsed.data.relationship || null,
    next_follow_up_at: parsed.data.nextFollowUpAt || null,
    notes: parsed.data.notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/career/contacts");
  return { success: "Contact added." };
}

export async function markContacted(contactId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("contacts")
    .update({ last_contacted_at: new Date().toISOString().slice(0, 10), next_follow_up_at: null })
    .eq("id", contactId)
    .eq("user_id", user.id);

  revalidatePath("/career/contacts");
  return { error: error?.message };
}

export async function setFollowUp(contactId: string, days: number) {
  const { supabase, user } = await requireUser();
  const date = new Date();
  date.setDate(date.getDate() + days);

  const { error } = await supabase
    .from("contacts")
    .update({ next_follow_up_at: date.toISOString().slice(0, 10) })
    .eq("id", contactId)
    .eq("user_id", user.id);

  revalidatePath("/career/contacts");
  return { error: error?.message };
}

export async function deleteContact(contactId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("contacts").delete().eq("id", contactId).eq("user_id", user.id);
  revalidatePath("/career/contacts");
  return { error: error?.message };
}
