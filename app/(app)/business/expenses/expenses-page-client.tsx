"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExpenseFormDialog } from "@/components/business/expense-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { runAction } from "@/lib/action-feedback";
import { deleteExpense } from "@/services/actions/invoicing";
import { EXPENSE_CATEGORY_LABEL } from "@/lib/constants";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import type { ExpenseWithClient } from "@/services/queries/invoicing";
import type { CrmClient } from "@/types/database";

export function ExpensesPageClient({
  organizationId,
  expenses,
  clients,
}: {
  organizationId: string;
  expenses: ExpenseWithClient[];
  clients: CrmClient[];
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} · {formatCurrency(total)} total
        </p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> Log expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses logged yet."
          description="Track what the business spends, and mark what's billable back to a client."
          actionLabel="Log expense"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Billable</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-muted-foreground">{formatShortDate(e.expense_date)}</TableCell>
                <TableCell>{EXPENSE_CATEGORY_LABEL[e.category]}</TableCell>
                <TableCell className="text-muted-foreground">{e.vendor ?? "—"}</TableCell>
                <TableCell>{formatCurrency(e.amount, e.currency)}</TableCell>
                <TableCell>
                  {e.is_billable ? <Badge variant="outline">{e.client_name ?? "Billable"}</Badge> : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive"
                    aria-label="Delete expense"
                    onClick={() => runAction(() => deleteExpense(organizationId, e.id))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ExpenseFormDialog organizationId={organizationId} clients={clients} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
