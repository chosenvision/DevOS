import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getVendors } from "@/services/queries/procurement";
import { getCrmItems } from "@/services/queries/invoicing";
import { NewPurchaseOrderClient } from "@/app/(app)/business/purchase-orders/new/new-purchase-order-client";

export const metadata: Metadata = { title: "New Purchase Order — DevOS" };

export default async function NewPurchaseOrderPage() {
  const { supabase, organization } = await requireActiveOrg();
  const [vendors, items] = await Promise.all([
    getVendors(supabase, organization.id),
    getCrmItems(supabase, organization.id),
  ]);

  return <NewPurchaseOrderClient organizationId={organization.id} vendors={vendors} items={items} />;
}
