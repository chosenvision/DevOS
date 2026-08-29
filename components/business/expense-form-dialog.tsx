"use client";

import * as React from "react";
import { useActionState } from "react";

import { createExpense, type ActionState } from "@/services/actions/invoicing";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { EXPENSE_CATEGORY_LABEL, EXPENSE_CATEGORY_ORDER } from "@/lib/constants";
import type { CrmClient } from "@/types/database";

const initialState: ActionState = {};

export function ExpenseFormDialog({
  organizationId,
  clients,
  open,
  onOpenChange,
}: {
  organizationId: string;
  clients: CrmClient[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState(
    async (_prev: ActionState, formData: FormData) => createExpense(organizationId, formData),
    initialState
  );
  const [billable, setBillable] = React.useState(false);

  if (state.success && open) onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log expense</DialogTitle>
          <DialogDescription>Track what the business spends.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="e-amount">Amount</Label>
              <Input id="e-amount" name="amount" type="number" min={0} step="0.01" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-date">Date</Label>
              <Input id="e-date" name="expenseDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select name="category" defaultValue="other">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORY_ORDER.map((c) => (
                    <SelectItem key={c} value={c}>
                      {EXPENSE_CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-vendor">Vendor</Label>
              <Input id="e-vendor" name="vendor" placeholder="AWS" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="hidden" name="isBillable" value={billable ? "on" : "off"} />
            <Checkbox id="e-billable" checked={billable} onCheckedChange={(c) => setBillable(!!c)} />
            <Label htmlFor="e-billable" className="font-normal">
              Billable to a client
            </Label>
          </div>
          {billable && (
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select name="clientId">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a client" />
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
          )}
          <div className="space-y-1.5">
            <Label htmlFor="e-notes">Notes</Label>
            <Textarea id="e-notes" name="notes" rows={2} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Log expense</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
