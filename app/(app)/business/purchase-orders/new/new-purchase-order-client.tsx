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
import { createPurchaseOrder } from "@/services/actions/procurement";
import { formatCurrency } from "@/lib/utils";
import type { CrmItem, Vendor } from "@/types/database";

interface LineItemRow {
  key: string;
  itemId: string;
  description: string;
  quantity: number;
  unitCost: number;
}

function newRow(): LineItemRow {
  return { key: crypto.randomUUID(), itemId: "", description: "", quantity: 1, unitCost: 0 };
}

export function NewPurchaseOrderClient({
  organizationId,
  vendors,
  items,
}: {
  organizationId: string;
  vendors: Vendor[];
  items: CrmItem[];
}) {
  const router = useRouter();
  const [vendorId, setVendorId] = React.useState("");
  const [orderDate, setOrderDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [rows, setRows] = React.useState<LineItemRow[]>([newRow()]);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const total = rows.reduce((sum, r) => sum + r.quantity * r.unitCost, 0);

  function updateRow(key: string, patch: Partial<LineItemRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function pickItem(key: string, itemId: string) {
    const item = items.find((i) => i.id === itemId);
    updateRow(key, { itemId, description: item?.name ?? "", unitCost: item?.unit_price ?? 0 });
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
    const res = await createPurchaseOrder(organizationId, {
      vendorId: vendorId || undefined,
      orderDate,
      expectedDate: expectedDate || undefined,
      notes: notes || undefined,
      lineItems: validRows.map((r) => ({
        itemId: r.itemId || undefined,
        description: r.description,
        quantity: r.quantity,
        unitCost: r.unitCost,
      })),
    });
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/business/purchase-orders");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Order details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Vendor</Label>
            <Select value={vendorId} onValueChange={setVendorId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="po-order">Order date</Label>
            <Input id="po-order" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="po-expected">Expected date</Label>
            <Input id="po-expected" type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
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
                <Input value={row.description} onChange={(e) => updateRow(row.key, { description: e.target.value })} />
              </div>
              <div className="col-span-4 space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  value={row.quantity}
                  onChange={(e) => updateRow(row.key, { quantity: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-4 space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Unit cost</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={row.unitCost}
                  onChange={(e) => updateRow(row.key, { unitCost: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-3 flex items-center justify-between gap-1 sm:col-span-1">
                <span className="text-xs text-muted-foreground">{formatCurrency(row.quantity * row.unitCost)}</span>
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
          <div className="ml-auto max-w-xs pt-2 text-right text-sm font-semibold">Total: {formatCurrency(total)}</div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent>
          <div className="space-y-1.5">
            <Label htmlFor="po-notes">Notes</Label>
            <Textarea id="po-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting}>
        Create purchase order
      </Button>
    </form>
  );
}
