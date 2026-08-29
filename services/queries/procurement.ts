import type { SupabaseClient } from "@supabase/supabase-js";

import type { PurchaseOrder, PurchaseOrderLineItem, Vendor } from "@/types/database";

export async function getVendors(supabase: SupabaseClient, organizationId: string): Promise<Vendor[]> {
  const { data } = await supabase.from("vendors").select("*").eq("organization_id", organizationId).order("name");
  return (data ?? []) as Vendor[];
}

export interface PurchaseOrderWithVendor extends PurchaseOrder {
  vendor_name: string | null;
}

export async function getPurchaseOrders(supabase: SupabaseClient, organizationId: string): Promise<PurchaseOrderWithVendor[]> {
  const { data } = await supabase
    .from("purchase_orders")
    .select("*, vendors(name)")
    .eq("organization_id", organizationId)
    .order("order_date", { ascending: false });

  return ((data ?? []) as unknown as (PurchaseOrder & { vendors: { name: string } | null })[]).map((row) => {
    const { vendors, ...po } = row;
    return { ...po, vendor_name: vendors?.name ?? null };
  });
}

export async function getNextPoNumber(supabase: SupabaseClient, organizationId: string): Promise<string> {
  const { count } = await supabase
    .from("purchase_orders")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  return `PO-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export async function getPurchaseOrderLineItems(
  supabase: SupabaseClient,
  purchaseOrderId: string
): Promise<PurchaseOrderLineItem[]> {
  const { data } = await supabase
    .from("purchase_order_line_items")
    .select("*")
    .eq("purchase_order_id", purchaseOrderId)
    .order("sort_order");

  return (data ?? []) as PurchaseOrderLineItem[];
}
