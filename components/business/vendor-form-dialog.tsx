"use client";

import { useActionState } from "react";

import { createVendor, type ActionState } from "@/services/actions/procurement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ActionState = {};

export function VendorFormDialog({
  organizationId,
  open,
  onOpenChange,
}: {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState(
    async (_prev: ActionState, formData: FormData) => createVendor(organizationId, formData),
    initialState
  );

  if (state.success && open) onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New vendor</DialogTitle>
          <DialogDescription>A supplier you buy from.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="v-name">Name</Label>
            <Input id="v-name" name="name" required autoFocus placeholder="Acme Supplies" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-email">Contact email</Label>
              <Input id="v-email" name="contactEmail" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-phone">Phone</Label>
              <Input id="v-phone" name="phone" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-notes">Notes</Label>
            <Textarea id="v-notes" name="notes" rows={2} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Add vendor</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
