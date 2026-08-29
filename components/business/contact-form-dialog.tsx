"use client";

import { useActionState } from "react";

import { createCrmContact, type ActionState } from "@/services/actions/crm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ActionState = {};

export function ContactFormDialog({
  organizationId,
  clientId,
  open,
  onOpenChange,
}: {
  organizationId: string;
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState(
    async (_prev: ActionState, formData: FormData) => createCrmContact(organizationId, formData),
    initialState
  );

  if (state.success && open) onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New contact</DialogTitle>
          <DialogDescription>A person at this client you work with.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          <div className="space-y-1.5">
            <Label htmlFor="ct-name">Name</Label>
            <Input id="ct-name" name="name" required autoFocus placeholder="Jamie Rivera" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ct-role">Role</Label>
            <Input id="ct-role" name="role" placeholder="Head of Product" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ct-email">Email</Label>
              <Input id="ct-email" name="email" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ct-phone">Phone</Label>
              <Input id="ct-phone" name="phone" />
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Add contact</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
