"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvoice } from "@/services/actions/invoicing";
import { formatCurrency } from "@/lib/utils";
import type { CrmClient, CrmItem } from "@/types/database";

interface LineItemRow {
  key: string;
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function newRow(): LineItemRow {
  return { key: crypto.randomUUID(), itemId: "", description: "", quantity: 1, unitPrice: 0 };
}

export function NewInvoiceClient({
  organizationId,
  clients,
  items,
}: {
  organizationId: string;
  clients: CrmClient[];
  items: CrmItem[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = React.useState("");
  const [issueDate, setIssueDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = React.useState("");
  const [taxRate, setTaxRate] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [rows, setRows] = React.useState<LineItemRow[]>([newRow()]);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const subtotal = rows.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  function updateRow(key: string, patch: Partial<LineItemRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function pickItem(key: string, itemId: string) {
    const item = items.find((i) => i.id === itemId);
    updateRow(key, {
      itemId,
      description: item?.name ?? "",
      unitPrice: item?.unit_price ?? 0,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validRows = rows.filter((r) => r.description.trim());
    if (validRows.length === 0) {
      setError("Add at least one line item.");
      return;
    }

    setSubmitting(true);
    const res = await createInvoice(organizationId, {
      clientId: clientId || undefined,
      issueDate,
      dueDate: dueDate || undefined,
      taxRate,
      currency: "USD",
      notes: notes || undefined,
      lineItems: validRows.map((r) => ({
        itemId: r.itemId || undefined,
        description: r.description,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
      })),
    });
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/business/invoices");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Invoice details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-issue">Issue date</Label>
              <Input id="inv-issue" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-due">Due date</Label>
              <Input id="inv-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Line items</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={() => setRows((prev) => [...prev, newRow()])}>
            <Plus className="size-3.5" /> Add line
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-12 items-end gap-2">
              <div className="col-span-12 space-y-1.5 sm:col-span-3">
                <Label className="text-xs">Item</Label>
                <Select value={row.itemId || undefined} onValueChange={(v) => pickItem(row.key, v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Custom" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-12 space-y-1.5 sm:col-span-4">
                <Label className="text-xs">Description</Label>
                <Input
                  value={row.description}
                  onChange={(e) => updateRow(row.key, { description: e.target.value })}
                  placeholder="What was delivered"
                />
              </div>
              <div className="col-span-4 space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={row.quantity}
                  onChange={(e) => updateRow(row.key, { quantity: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-4 space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Price</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={row.unitPrice}
                  onChange={(e) => updateRow(row.key, { unitPrice: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-3 flex items-center justify-between gap-1 sm:col-span-1">
                <span className="text-xs text-muted-foreground">{formatCurrency(row.quantity * row.unitPrice)}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7 shrink-0 text-destructive"
                  aria-label="Remove line"
                  disabled={rows.length === 1}
                  onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}

          <div className="ml-auto max-w-xs space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <Label htmlFor="inv-tax" className="text-muted-foreground">
                Tax %
              </Label>
              <Input
                id="inv-tax"
                type="number"
                min={0}
                max={100}
                step="0.1"
                className="h-7 w-20 text-right"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent>
          <div className="space-y-1.5">
            <Label htmlFor="inv-notes">Notes</Label>
            <Textarea id="inv-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Payment terms, thank you note..." />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting}>
        Create invoice
      </Button>
    </form>
  );
}
