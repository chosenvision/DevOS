import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getPurchaseOrders, getVendors } from "@/services/queries/procurement";
import { PurchaseOrdersPageClient } from "@/app/(app)/business/purchase-orders/purchase-orders-page-client";

export const metadata: Metadata = { title: "Purchase Orders — DevOS" };

export default async function PurchaseOrdersPage() {
  const { supabase, organization } = await requireActiveOrg();
  const [orders, vendors] = await Promise.all([
    getPurchaseOrders(supabase, organization.id),
    getVendors(supabase, organization.id),
  ]);

  return <PurchaseOrdersPageClient organizationId={organization.id} orders={orders} vendors={vendors} />;
}
