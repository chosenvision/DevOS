import type { SupabaseClient } from "@supabase/supabase-js";

import type { CrmItem, Expense, Invoice, InvoiceLineItem } from "@/types/database";

export async function getCrmItems(supabase: SupabaseClient, organizationId: string): Promise<CrmItem[]> {
  const { data } = await supabase
    .from("crm_items")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name");

  return (data ?? []) as CrmItem[];
}

export interface InvoiceWithClient extends Invoice {
  client_name: string | null;
}

export async function getInvoices(supabase: SupabaseClient, organizationId: string): Promise<InvoiceWithClient[]> {
  const { data } = await supabase
    .from("invoices")
    .select("*, crm_clients(name)")
    .eq("organization_id", organizationId)
    .order("issue_date", { ascending: false });

  return ((data ?? []) as unknown as (Invoice & { crm_clients: { name: string } | null })[]).map((row) => {
    const { crm_clients, ...invoice } = row;
    return { ...invoice, client_name: crm_clients?.name ?? null };
  });
}

export interface InvoiceDetail {
  invoice: InvoiceWithClient;
  lineItems: InvoiceLineItem[];
}

export async function getInvoiceDetail(
  supabase: SupabaseClient,
  organizationId: string,
  invoiceId: string
): Promise<InvoiceDetail | null> {
  const { data: invoiceRow } = await supabase
    .from("invoices")
    .select("*, crm_clients(name)")
    .eq("id", invoiceId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!invoiceRow) return null;

  const { crm_clients, ...invoice } = invoiceRow as unknown as Invoice & { crm_clients: { name: string } | null };

  const { data: lineItems } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("sort_order");

  return {
    invoice: { ...invoice, client_name: crm_clients?.name ?? null },
    lineItems: (lineItems ?? []) as InvoiceLineItem[],
  };
}

/** Next sequential invoice number for the org, formatted INV-0001, INV-0002, ... */
export async function getNextInvoiceNumber(supabase: SupabaseClient, organizationId: string): Promise<string> {
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  return `INV-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export interface ExpenseWithClient extends Expense {
  client_name: string | null;
}

export async function getExpenses(supabase: SupabaseClient, organizationId: string): Promise<ExpenseWithClient[]> {
  const { data } = await supabase
    .from("expenses")
    .select("*, crm_clients(name)")
    .eq("organization_id", organizationId)
    .order("expense_date", { ascending: false });

  return ((data ?? []) as unknown as (Expense & { crm_clients: { name: string } | null })[]).map((row) => {
    const { crm_clients, ...expense } = row;
    return { ...expense, client_name: crm_clients?.name ?? null };
  });
}
