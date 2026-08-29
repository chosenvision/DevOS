import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getInvoices } from "@/services/queries/invoicing";
import { InvoicesPageClient } from "@/app/(app)/business/invoices/invoices-page-client";

export const metadata: Metadata = { title: "Invoices — DevOS" };

export default async function InvoicesPage() {
  const { supabase, organization } = await requireActiveOrg();
  const invoices = await getInvoices(supabase, organization.id);

  return <InvoicesPageClient organizationId={organization.id} invoices={invoices} />;
}
