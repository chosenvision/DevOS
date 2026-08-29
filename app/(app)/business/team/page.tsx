import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getOrgMembers } from "@/services/queries/organizations";
import { getPayrollRecords, getTimeOffRequests } from "@/services/queries/payroll";
import { TeamPageClient } from "@/app/(app)/business/team/team-page-client";

export const metadata: Metadata = { title: "Team — DevOS" };

export default async function TeamPage() {
  const { supabase, user, organization, role } = await requireActiveOrg();
  const [members, payrollRecords, timeOffRequests] = await Promise.all([
    getOrgMembers(supabase, organization.id),
    getPayrollRecords(supabase, organization.id),
    getTimeOffRequests(supabase, organization.id),
  ]);

  return (
    <TeamPageClient
      organizationId={organization.id}
      currentUserId={user.id}
      currentRole={role}
      members={members}
      payrollRecords={payrollRecords}
      timeOffRequests={timeOffRequests}
    />
  );
}
