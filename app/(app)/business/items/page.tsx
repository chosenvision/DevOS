import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getCrmItems } from "@/services/queries/invoicing";
import { ItemsPageClient } from "@/app/(app)/business/items/items-page-client";

export const metadata: Metadata = { title: "Items — DevOS" };

export default async function ItemsPage() {
  const { supabase, organization } = await requireActiveOrg();
  const items = await getCrmItems(supabase, organization.id);

  return <ItemsPageClient organizationId={organization.id} items={items} />;
}
