"use client";

import { useActionState } from "react";

import { createCrmActivity, type ActionState } from "@/services/actions/crm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { CRM_ACTIVITY_TYPE_LABEL } from "@/lib/constants";
import type { CrmActivityType } from "@/types/database";

const initialState: ActionState = {};
const TYPES: CrmActivityType[] = ["call", "email", "meeting", "note"];

export function ActivityFormDialog({
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
    async (_prev: ActionState, formData: FormData) => createCrmActivity(organizationId, formData),
    initialState
  );

  if (state.success && open) onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Log activity</DialogTitle>
          <DialogDescription>A call, email, meeting, or note with this client.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select name="type" defaultValue="note">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {CRM_ACTIVITY_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-desc">What happened</Label>
            <Textarea id="a-desc" name="description" rows={3} required autoFocus placeholder="Discussed scope for phase 2..." />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Log it</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
