import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getCrmDeals, getCrmClients } from "@/services/queries/crm";
import { DealsPageClient } from "@/app/(app)/business/deals/deals-page-client";

export const metadata: Metadata = { title: "Deals — DevOS" };

export default async function DealsPage() {
  const { supabase, organization } = await requireActiveOrg();
  const [deals, clients] = await Promise.all([
    getCrmDeals(supabase, organization.id),
    getCrmClients(supabase, organization.id),
  ]);

  return <DealsPageClient organizationId={organization.id} deals={deals} clients={clients} />;
}
