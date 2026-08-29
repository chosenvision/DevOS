"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Printer, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { runAction } from "@/lib/action-feedback";
import { deleteInvoice, updateInvoiceStatus } from "@/services/actions/invoicing";
import { INVOICE_STATUS_BADGE, INVOICE_STATUS_LABEL } from "@/lib/constants";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import type { InvoiceStatus } from "@/types/database";
import type { InvoiceWithClient } from "@/services/queries/invoicing";

const STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue", "void"];

export function InvoicesPageClient({
  organizationId,
  invoices,
}: {
  organizationId: string;
  invoices: InvoiceWithClient[];
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{invoices.length} invoices</p>
        <Button onClick={() => router.push("/business/invoices/new")}>
          <Plus className="size-4" /> New invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet."
          description="Bill your clients for work and track payment status."
          actionLabel="Create invoice"
          onAction={() => router.push("/business/invoices/new")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                <TableCell className="text-muted-foreground">{inv.client_name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{formatShortDate(inv.issue_date)}</TableCell>
                <TableCell>{formatCurrency(inv.total, inv.currency)}</TableCell>
                <TableCell>
                  <Select
                    value={inv.status}
                    onValueChange={(v) => runAction(() => updateInvoiceStatus(organizationId, inv.id, v))}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <Badge variant={INVOICE_STATUS_BADGE[inv.status]} className="pointer-events-none">
                        {INVOICE_STATUS_LABEL[inv.status]}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {INVOICE_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="size-7" aria-label={`View ${inv.invoice_number}`} asChild>
                      <Link href={`/print/invoice/${inv.id}`} target="_blank">
                        <Printer className="size-3.5" />
                      </Link>
                    </Button>
                    {inv.status === "draft" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive"
                        aria-label={`Delete ${inv.invoice_number}`}
                        onClick={() => runAction(() => deleteInvoice(organizationId, inv.id))}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
