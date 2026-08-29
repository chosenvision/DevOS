import type { SupabaseClient } from "@supabase/supabase-js";

import type { PayrollRecord, TimeOffRequest } from "@/types/database";

export interface PayrollRecordWithMember extends PayrollRecord {
  member_name: string | null;
}

/**
 * Admins see every record (RLS enforces this); a non-admin caller only ever
 * gets their own back. organization_members and profiles both reference
 * auth.users independently rather than each other, so there's no FK for
 * PostgREST to embed profiles through — fetched and joined in JS instead,
 * same pattern as getOrgMembers in services/queries/organizations.ts.
 */
export async function getPayrollRecords(supabase: SupabaseClient, organizationId: string): Promise<PayrollRecordWithMember[]> {
  const { data: raw } = await supabase
    .from("payroll_records")
    .select("*")
    .eq("organization_id", organizationId)
    .order("pay_period_start", { ascending: false });

  const records = (raw ?? []) as PayrollRecord[];
  if (records.length === 0) return [];

  const memberIds = [...new Set(records.map((r) => r.member_id))];
  const { data: members } = await supabase.from("organization_members").select("id, user_id").in("id", memberIds);
  const userIds = (members ?? []).map((m) => m.user_id).filter((id): id is string => Boolean(id));
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] };

  const profileByUserId = new Map((profiles ?? []).map((p) => [p.id, p.full_name as string | null]));
  const nameByMemberId = new Map(
    (members ?? []).map((m) => [m.id, m.user_id ? (profileByUserId.get(m.user_id) ?? null) : null])
  );

  return records.map((r) => ({ ...r, member_name: nameByMemberId.get(r.member_id) ?? null }));
}

export interface TimeOffRequestWithMember extends TimeOffRequest {
  member_name: string | null;
}

export async function getTimeOffRequests(supabase: SupabaseClient, organizationId: string): Promise<TimeOffRequestWithMember[]> {
  const { data: raw } = await supabase
    .from("time_off_requests")
    .select("*")
    .eq("organization_id", organizationId)
    .order("start_date", { ascending: false });

  const requests = (raw ?? []) as TimeOffRequest[];
  if (requests.length === 0) return [];

  const memberIds = [...new Set(requests.map((r) => r.member_id))];
  const { data: members } = await supabase.from("organization_members").select("id, user_id").in("id", memberIds);
  const userIds = (members ?? []).map((m) => m.user_id).filter((id): id is string => Boolean(id));
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] };

  const profileByUserId = new Map((profiles ?? []).map((p) => [p.id, p.full_name as string | null]));
  const nameByMemberId = new Map(
    (members ?? []).map((m) => [m.id, m.user_id ? (profileByUserId.get(m.user_id) ?? null) : null])
  );

  return requests.map((r) => ({ ...r, member_name: nameByMemberId.get(r.member_id) ?? null }));
}
