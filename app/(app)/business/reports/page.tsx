import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getBusinessReport } from "@/services/queries/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeExpenseChart } from "@/components/business/income-expense-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/motion";
import { EXPENSE_CATEGORY_LABEL } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports — DevOS" };

export default async function ReportsPage() {
  const { supabase, organization } = await requireActiveOrg();
  const report = await getBusinessReport(supabase, organization.id);

  const hasData = report.totalIncome > 0 || report.totalExpense > 0;
  const net = report.totalIncome - report.totalExpense;

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="grid grid-cols-3 gap-3">
          <Card className="gap-1 py-4">
            <p className="px-5 text-xs font-medium text-muted-foreground">Income (6mo)</p>
            <p className="px-5 text-xl font-semibold tabular-nums">{formatCurrency(report.totalIncome)}</p>
          </Card>
          <Card className="gap-1 py-4">
            <p className="px-5 text-xs font-medium text-muted-foreground">Expenses (6mo)</p>
            <p className="px-5 text-xl font-semibold tabular-nums">{formatCurrency(report.totalExpense)}</p>
          </Card>
          <Card className="gap-1 py-4">
            <p className="px-5 text-xs font-medium text-muted-foreground">Net</p>
            <p className={`px-5 text-xl font-semibold tabular-nums ${net >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(net)}
            </p>
          </Card>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <Card className="py-4">
          <CardHeader>
            <CardTitle className="text-sm">Income vs. expense, last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <IncomeExpenseChart data={report.monthly} />
            ) : (
              <EmptyState title="No data yet." description="Paid invoices and logged expenses will show up here." />
            )}
          </CardContent>
        </Card>
      </Reveal>

      {report.expenseByCategory.length > 0 && (
        <Reveal delay={0.14}>
          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-sm">Expenses by category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.expenseByCategory.map((row) => (
                <div key={row.category} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{EXPENSE_CATEGORY_LABEL[row.category]}</span>
                  <span className="font-medium">{formatCurrency(row.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      )}

      <p className="text-xs text-muted-foreground">
        A simple income-vs-expense view from paid invoices and logged expenses — not double-entry bookkeeping, tax
        preparation, or accounting software. For real accounting, export this data into a dedicated tool.
      </p>
    </div>
  );
}
