"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { INVOICE_STATUS_LABEL } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceDetail } from "@/services/queries/invoicing";

export function InvoicePrintView({ detail, orgName }: { detail: InvoiceDetail; orgName: string }) {
  const { invoice, lineItems } = detail;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="size-4" /> Print / Save as PDF
        </Button>
      </div>

      <div className="space-y-8 bg-white p-10 text-black shadow-sm print:shadow-none">
        <header className="flex items-start justify-between border-b border-neutral-300 pb-6">
          <div>
            <h1 className="text-2xl font-bold">{orgName}</h1>
            <p className="mt-1 text-sm text-neutral-600">Invoice {invoice.invoice_number}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium uppercase tracking-wide text-neutral-500">{INVOICE_STATUS_LABEL[invoice.status]}</p>
            <p className="mt-1 text-neutral-600">Issued {formatDate(invoice.issue_date)}</p>
            {invoice.due_date && <p className="text-neutral-600">Due {formatDate(invoice.due_date)}</p>}
          </div>
        </header>

        {invoice.client_name && (
          <section>
            <h2 className="mb-1 text-xs font-bold tracking-wide text-neutral-500 uppercase">Billed to</h2>
            <p className="text-sm">{invoice.client_name}</p>
          </section>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-300 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li) => (
              <tr key={li.id} className="border-b border-neutral-200">
                <td className="py-2">{li.description}</td>
                <td className="py-2 text-right">{li.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(li.unit_price, invoice.currency)}</td>
                <td className="py-2 text-right">{formatCurrency(li.amount, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.tax_rate > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-600">Tax ({invoice.tax_rate}%)</span>
              <span>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-300 pt-1 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>

        {invoice.notes && (
          <section>
            <h2 className="mb-1 text-xs font-bold tracking-wide text-neutral-500 uppercase">Notes</h2>
            <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
          </section>
        )}
      </div>
    </div>
  );
}
