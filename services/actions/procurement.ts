"use server";

import { revalidatePath } from "next/cache";

import { requireOrgMember } from "@/services/auth";
import { getNextPoNumber } from "@/services/queries/procurement";
import { vendorSchema, purchaseOrderSchema, type PurchaseOrderInput } from "@/lib/validations/procurement";

export type ActionState = { error?: string; success?: string; id?: string };

function orNull(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

// ---------- Vendors ----------

export async function createVendor(organizationId: string, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const parsed = vendorSchema.safeParse({
    name: formData.get("name"),
    contactEmail: formData.get("contactEmail") || undefined,
    phone: formData.get("phone") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("vendors").insert({
    organization_id: organizationId,
    name: parsed.data.name,
    contact_email: orNull(parsed.data.contactEmail),
    phone: orNull(parsed.data.phone),
    notes: orNull(parsed.data.notes),
  });

  if (error) return { error: error.message };

  revalidatePath("/business/purchase-orders");
  return { success: "Vendor added." };
}

export async function deleteVendor(organizationId: string, vendorId: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase.from("vendors").delete().eq("id", vendorId).eq("organization_id", organizationId);
  if (error) return { error: error.message };

  revalidatePath("/business/purchase-orders");
  return { success: "Vendor removed." };
}

// ---------- Purchase orders ----------

export async function createPurchaseOrder(organizationId: string, input: PurchaseOrderInput): Promise<ActionState> {
  const { supabase, user } = await requireOrgMember(organizationId);

  const parsed = purchaseOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const total = parsed.data.lineItems.reduce((sum, li) => sum + li.quantity * li.unitCost, 0);
  const poNumber = await getNextPoNumber(supabase, organizationId);

  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .insert({
      organization_id: organizationId,
      vendor_id: orNull(parsed.data.vendorId),
      po_number: poNumber,
      order_date: parsed.data.orderDate,
      expected_date: orNull(parsed.data.expectedDate),
      total,
      notes: orNull(parsed.data.notes),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (poError || !po) {
    return { error: poError?.message ?? "Could not create purchase order." };
  }

  const lineItemRows = parsed.data.lineItems.map((li, index) => ({
    organization_id: organizationId,
    purchase_order_id: po.id,
    item_id: orNull(li.itemId),
    description: li.description,
    quantity: li.quantity,
    unit_cost: li.unitCost,
    amount: li.quantity * li.unitCost,
    sort_order: index,
  }));

  const { error: lineItemError } = await supabase.from("purchase_order_line_items").insert(lineItemRows);
  if (lineItemError) {
    return { error: lineItemError.message };
  }

  revalidatePath("/business/purchase-orders");
  return { success: `Created ${poNumber}.`, id: po.id };
}

export async function updatePurchaseOrderStatus(organizationId: string, poId: string, status: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { data: current } = await supabase
    .from("purchase_orders")
    .select("status")
    .eq("id", poId)
    .eq("organization_id", organizationId)
    .single();

  const { error } = await supabase
    .from("purchase_orders")
    .update({ status })
    .eq("id", poId)
    .eq("organization_id", organizationId);

  if (error) return { error: error.message };

  // Receiving stock only happens once, the same guarded transition pattern
  // as the invoice-sent stock decrement in services/actions/invoicing.ts.
  if (current?.status !== "received" && status === "received") {
    const { data: lineItems } = await supabase
      .from("purchase_order_line_items")
      .select("item_id, quantity")
      .eq("purchase_order_id", poId)
      .not("item_id", "is", null);

    for (const li of lineItems ?? []) {
      const { data: item } = await supabase
        .from("crm_items")
        .select("stock_quantity")
        .eq("id", li.item_id)
        .not("stock_quantity", "is", null)
        .maybeSingle();

      if (item && item.stock_quantity !== null) {
        await supabase
          .from("crm_items")
          .update({ stock_quantity: item.stock_quantity + li.quantity })
          .eq("id", li.item_id);
      }
    }
    revalidatePath("/business/items");
  }

  revalidatePath("/business/purchase-orders");
  return { success: "Purchase order updated." };
}

export async function deletePurchaseOrder(organizationId: string, poId: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase.from("purchase_orders").delete().eq("id", poId).eq("organization_id", organizationId);
  if (error) return { error: error.message };

  revalidatePath("/business/purchase-orders");
  return { success: "Purchase order deleted." };
}
