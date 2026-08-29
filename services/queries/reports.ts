import type { SupabaseClient } from "@supabase/supabase-js";

import { EXPENSE_CATEGORY_ORDER } from "@/lib/constants";
import type { ExpenseCategory } from "@/types/database";

export interface MonthlyIncomeExpense {
  month: string; // "2026-01"
  label: string; // "Jan 2026"
  income: number;
  expense: number;
}

export interface BusinessReport {
  monthly: MonthlyIncomeExpense[];
  expenseByCategory: { category: ExpenseCategory; amount: number }[];
  totalIncome: number;
  totalExpense: number;
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Income vs. expense for the last 6 months, plus expense-by-category totals. Deliberately simple —
 * not double-entry bookkeeping, just paid invoices vs. logged expenses. */
export async function getBusinessReport(supabase: SupabaseClient, organizationId: string): Promise<BusinessReport> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const since = sixMonthsAgo.toISOString().slice(0, 10);

  const [{ data: invoices }, { data: expenses }] = await Promise.all([
    supabase
      .from("invoices")
      .select("total, issue_date, status")
      .eq("organization_id", organizationId)
      .eq("status", "paid")
      .gte("issue_date", since),
    supabase.from("expenses").select("amount, expense_date, category").eq("organization_id", organizationId).gte("expense_date", since),
  ]);

  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }

  const monthly: Record<string, MonthlyIncomeExpense> = {};
  for (const m of months) {
    monthly[m] = { month: m, label: monthLabel(m), income: 0, expense: 0 };
  }

  let totalIncome = 0;
  for (const inv of invoices ?? []) {
    const key = monthKey(inv.issue_date);
    if (monthly[key]) monthly[key].income += Number(inv.total) || 0;
    totalIncome += Number(inv.total) || 0;
  }

  let totalExpense = 0;
  const categoryTotals = new Map<ExpenseCategory, number>();
  for (const exp of expenses ?? []) {
    const key = monthKey(exp.expense_date);
    if (monthly[key]) monthly[key].expense += Number(exp.amount) || 0;
    totalExpense += Number(exp.amount) || 0;
    categoryTotals.set(exp.category, (categoryTotals.get(exp.category) ?? 0) + (Number(exp.amount) || 0));
  }

  const expenseByCategory = EXPENSE_CATEGORY_ORDER.filter((c) => (categoryTotals.get(c) ?? 0) > 0).map((c) => ({
    category: c,
    amount: categoryTotals.get(c) ?? 0,
  }));

  return { monthly: months.map((m) => monthly[m]), expenseByCategory, totalIncome, totalExpense };
}
