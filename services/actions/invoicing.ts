"use server";

import { revalidatePath } from "next/cache";

import { requireOrgMember } from "@/services/auth";
import { getNextInvoiceNumber } from "@/services/queries/invoicing";
import { crmItemSchema, invoiceSchema, expenseSchema, type InvoiceInput } from "@/lib/validations/invoicing";

export type ActionState = { error?: string; success?: string; id?: string };

function orNull(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

// ---------- Items ----------

export async function createCrmItem(organizationId: string, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const parsed = crmItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    unitPrice: formData.get("unitPrice") || 0,
    unit: formData.get("unit") || "fixed",
    sku: formData.get("sku") || undefined,
    stockQuantity: formData.get("stockQuantity") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("crm_items").insert({
    organization_id: organizationId,
    name: parsed.data.name,
    description: orNull(parsed.data.description),
    unit_price: parsed.data.unitPrice,
    unit: parsed.data.unit,
    sku: orNull(parsed.data.sku),
    stock_quantity: parsed.data.stockQuantity === "" || parsed.data.stockQuantity === undefined ? null : parsed.data.stockQuantity,
  });

  if (error) return { error: error.message };

  revalidatePath("/business/items");
  return { success: "Item added." };
}

export async function deleteCrmItem(organizationId: string, itemId: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase.from("crm_items").delete().eq("id", itemId).eq("organization_id", organizationId);
  if (error) return { error: error.message };

  revalidatePath("/business/items");
  return { success: "Item removed." };
}

// ---------- Invoices ----------

export async function createInvoice(organizationId: string, input: InvoiceInput): Promise<ActionState> {
  const { supabase, user } = await requireOrgMember(organizationId);

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const subtotal = parsed.data.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  const taxAmount = subtotal * (parsed.data.taxRate / 100);
  const total = subtotal + taxAmount;
  const invoiceNumber = await getNextInvoiceNumber(supabase, organizationId);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      organization_id: organizationId,
      client_id: orNull(parsed.data.clientId),
      invoice_number: invoiceNumber,
      issue_date: parsed.data.issueDate,
      due_date: orNull(parsed.data.dueDate),
      subtotal,
      tax_rate: parsed.data.taxRate,
      tax_amount: taxAmount,
      total,
      currency: parsed.data.currency,
      notes: orNull(parsed.data.notes),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (invoiceError || !invoice) {
    return { error: invoiceError?.message ?? "Could not create invoice." };
  }

  const lineItemRows = parsed.data.lineItems.map((li, index) => ({
    organization_id: organizationId,
    invoice_id: invoice.id,
    item_id: orNull(li.itemId),
    description: li.description,
    quantity: li.quantity,
    unit_price: li.unitPrice,
    amount: li.quantity * li.unitPrice,
    sort_order: index,
  }));

  const { error: lineItemError } = await supabase.from("invoice_line_items").insert(lineItemRows);
  if (lineItemError) {
    return { error: lineItemError.message };
  }

  revalidatePath("/business/invoices");
  revalidatePath("/business");
  return { success: `Created ${invoiceNumber}.`, id: invoice.id };
}

export async function updateInvoiceStatus(organizationId: string, invoiceId: string, status: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { data: current } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", invoiceId)
    .eq("organization_id", organizationId)
    .single();

  const { error } = await supabase
    .from("invoices")
    .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
    .eq("id", invoiceId)
    .eq("organization_id", organizationId);

  if (error) return { error: error.message };

  // Decrement stock the first time an invoice is sent (draft -> sent), not on
  // every later status change (sent -> paid -> overdue would otherwise
  // double-decrement the same line items).
  if (current?.status === "draft" && status === "sent") {
    const { data: lineItems } = await supabase
      .from("invoice_line_items")
      .select("item_id, quantity")
      .eq("invoice_id", invoiceId)
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
          .update({ stock_quantity: Math.max(0, item.stock_quantity - li.quantity) })
          .eq("id", li.item_id);
      }
    }
    revalidatePath("/business/items");
  }

  revalidatePath("/business/invoices");
  revalidatePath("/business");
  return { success: "Invoice updated." };
}

export async function deleteInvoice(organizationId: string, invoiceId: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase.from("invoices").delete().eq("id", invoiceId).eq("organization_id", organizationId);
  if (error) return { error: error.message };

  revalidatePath("/business/invoices");
  revalidatePath("/business");
  return { success: "Invoice deleted." };
}

// ---------- Expenses ----------

export async function createExpense(organizationId: string, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireOrgMember(organizationId);

  const parsed = expenseSchema.safeParse({
    category: formData.get("category") || "other",
    vendor: formData.get("vendor") || undefined,
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
    isBillable: formData.get("isBillable") === "on",
    clientId: formData.get("clientId") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("expenses").insert({
    organization_id: organizationId,
    category: parsed.data.category,
    vendor: orNull(parsed.data.vendor),
    amount: parsed.data.amount,
    expense_date: parsed.data.expenseDate,
    is_billable: parsed.data.isBillable,
    client_id: parsed.data.isBillable ? orNull(parsed.data.clientId) : null,
    notes: orNull(parsed.data.notes),
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/business/expenses");
  return { success: "Expense logged." };
}

export async function deleteExpense(organizationId: string, expenseId: string): Promise<ActionState> {
  const { supabase } = await requireOrgMember(organizationId);

  const { error } = await supabase.from("expenses").delete().eq("id", expenseId).eq("organization_id", organizationId);
  if (error) return { error: error.message };

  revalidatePath("/business/expenses");
  return { success: "Expense removed." };
}
