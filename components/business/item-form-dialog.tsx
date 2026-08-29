"use client";

import { useActionState } from "react";

import { createCrmItem, type ActionState } from "@/services/actions/invoicing";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { CRM_ITEM_UNIT_LABEL } from "@/lib/constants";
import type { CrmItemUnit } from "@/types/database";

const initialState: ActionState = {};
const UNITS: CrmItemUnit[] = ["fixed", "hour", "item"];

export function ItemFormDialog({
  organizationId,
  open,
  onOpenChange,
}: {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState(
    async (_prev: ActionState, formData: FormData) => createCrmItem(organizationId, formData),
    initialState
  );

  if (state.success && open) onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
          <DialogDescription>A service or product you bill clients for.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="i-name">Name</Label>
            <Input id="i-name" name="name" required autoFocus placeholder="Frontend development" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="i-price">Unit price</Label>
              <Input id="i-price" name="unitPrice" type="number" min={0} step="0.01" required defaultValue={0} />
            </div>
            <div className="space-y-1.5">
              <Label>Billed</Label>
              <Select name="unit" defaultValue="fixed">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {CRM_ITEM_UNIT_LABEL[u]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="i-sku">SKU (optional)</Label>
              <Input id="i-sku" name="sku" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="i-stock">Stock quantity</Label>
              <Input id="i-stock" name="stockQuantity" type="number" step="1" placeholder="Leave blank for a service" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-desc">Description</Label>
            <Textarea id="i-desc" name="description" rows={2} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Add item</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
