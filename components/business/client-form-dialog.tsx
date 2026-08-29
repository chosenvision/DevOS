"use client";

import { useActionState } from "react";

import { createCrmClient, type ActionState } from "@/services/actions/crm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ActionState = {};

export function ClientFormDialog({
  organizationId,
  open,
  onOpenChange,
}: {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState(
    async (_prev: ActionState, formData: FormData) => createCrmClient(organizationId, formData),
    initialState
  );

  if (state.success && open) onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New client</DialogTitle>
          <DialogDescription>Add a business to track deals, contacts, and activity against.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" name="name" required autoFocus placeholder="Acme Corp" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-industry">Industry</Label>
              <Input id="c-industry" name="industry" placeholder="Fintech" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-website">Website</Label>
              <Input id="c-website" name="website" placeholder="https://acme.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-notes">Notes</Label>
            <Textarea id="c-notes" name="notes" rows={3} placeholder="How you know them, context..." />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Add client</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
