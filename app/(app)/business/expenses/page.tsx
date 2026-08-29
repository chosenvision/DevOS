import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getExpenses } from "@/services/queries/invoicing";
import { getCrmClients } from "@/services/queries/crm";
import { ExpensesPageClient } from "@/app/(app)/business/expenses/expenses-page-client";

export const metadata: Metadata = { title: "Expenses — DevOS" };

export default async function ExpensesPage() {
  const { supabase, organization } = await requireActiveOrg();
  const [expenses, clients] = await Promise.all([
    getExpenses(supabase, organization.id),
    getCrmClients(supabase, organization.id),
  ]);

  return <ExpensesPageClient organizationId={organization.id} expenses={expenses} clients={clients} />;
}
