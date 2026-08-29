import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getOrgMembers } from "@/services/queries/organizations";
import { TeamPageClient } from "@/app/(app)/business/team/team-page-client";

export const metadata: Metadata = { title: "Team — DevOS" };

export default async function TeamPage() {
  const { supabase, user, organization, role } = await requireActiveOrg();
  const members = await getOrgMembers(supabase, organization.id);

  return (
    <TeamPageClient
      organizationId={organization.id}
      currentUserId={user.id}
      currentRole={role}
      members={members}
    />
  );
}
