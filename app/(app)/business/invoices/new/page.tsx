import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getCrmClients } from "@/services/queries/crm";
import { getCrmItems } from "@/services/queries/invoicing";
import { NewInvoiceClient } from "@/app/(app)/business/invoices/new/new-invoice-client";

export const metadata: Metadata = { title: "New Invoice — DevOS" };

export default async function NewInvoicePage() {
  const { supabase, organization } = await requireActiveOrg();
  const [clients, items] = await Promise.all([
    getCrmClients(supabase, organization.id),
    getCrmItems(supabase, organization.id),
  ]);

  return <NewInvoiceClient organizationId={organization.id} clients={clients} items={items} />;
}
