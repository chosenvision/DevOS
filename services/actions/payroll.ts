"use server";

import { revalidatePath } from "next/cache";

import { requireOrgMember } from "@/services/auth";
import { payrollRecordSchema, timeOffRequestSchema, type TimeOffRequestInput } from "@/lib/validations/procurement";

export type ActionState = { error?: string; success?: string };

function orNull(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

// ---------- Payroll (admin/owner only — RLS enforces this too) ----------

export async function createPayrollRecord(organizationId: string, formData: FormData): Promise<ActionState> {
  const { supabase, role } = await requireOrgMember(organizationId);

  if (role === "member") {
    return { error: "Only owners and admins can record payroll." };
  }

  const parsed = payrollRecordSchema.safeParse({
    memberId: formData.get("memberId"),
    payPeriodStart: formData.get("payPeriodStart"),
    payPeriodEnd: formData.get("payPeriodEnd"),
    grossAmount: formData.get("grossAmount"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("payroll_records").insert({
    organization_id: organizationId,
    member_id: parsed.data.memberId,
    pay_period_start: parsed.data.payPeriodStart,
    pay_period_end: parsed.data.payPeriodEnd,
    gross_amount: parsed.data.grossAmount,
    notes: orNull(parsed.data.notes),
    status: "recorded",
    recorded_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/business/team");
  return { success: "Payroll recorded." };
}

export async function deletePayrollRecord(organizationId: string, recordId: string): Promise<ActionState> {
  const { supabase, role } = await requireOrgMember(organizationId);

  if (role === "member") {
    return { error: "Only owners and admins can delete payroll records." };
  }

  const { error } = await supabase.from("payroll_records").delete().eq("id", recordId).eq("organization_id", organizationId);
  if (error) return { error: error.message };

  revalidatePath("/business/team");
  return { success: "Payroll record removed." };
}

// ---------- Time off ----------

export async function createTimeOffRequest(organizationId: string, input: TimeOffRequestInput): Promise<ActionState> {
  const { supabase, user } = await requireOrgMember(organizationId);

  const parsed = timeOffRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Derived from the signed-in user, never trusted from the client — a
  // member can only ever request time off for themselves (RLS backs this
  // up too: the insert policy checks the member row's user_id matches).
  const { data: membership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "Could not find your membership in this organization." };
  }

  const { error } = await supabase.from("time_off_requests").insert({
    organization_id: organizationId,
    member_id: membership.id,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
    type: parsed.data.type,
    notes: orNull(parsed.data.notes),
  });

  if (error) return { error: error.message };

  revalidatePath("/business/team");
  return { success: "Time off requested." };
}

export async function cancelTimeOffRequest(organizationId: string, requestId: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase
    .from("time_off_requests")
    .delete()
    .eq("id", requestId)
    .eq("organization_id", organizationId);

  if (error) return { error: error.message };

  revalidatePath("/business/team");
  return { success: "Request cancelled." };
}

export async function reviewTimeOffRequest(
  organizationId: string,
  requestId: string,
  status: "approved" | "denied"
): Promise<ActionState> {
  const { supabase, role } = await requireOrgMember(organizationId);

  if (role === "member") {
    return { error: "Only owners and admins can approve or deny time off." };
  }

  const { error } = await supabase
    .from("time_off_requests")
    .update({ status })
    .eq("id", requestId)
    .eq("organization_id", organizationId);

  if (error) return { error: error.message };

  revalidatePath("/business/team");
  return { success: status === "approved" ? "Approved." : "Denied." };
}
