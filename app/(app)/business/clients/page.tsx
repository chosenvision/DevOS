import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getCrmClients } from "@/services/queries/crm";
import { ClientsPageClient } from "@/app/(app)/business/clients/clients-page-client";

export const metadata: Metadata = { title: "Clients — DevOS" };

export default async function ClientsPage() {
  const { supabase, organization } = await requireActiveOrg();
  const clients = await getCrmClients(supabase, organization.id);

  return <ClientsPageClient organizationId={organization.id} clients={clients} />;
}
