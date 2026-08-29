"use client";

import { useActionState } from "react";

import { createCrmDeal, type ActionState } from "@/services/actions/crm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { CRM_DEAL_STAGE_LABEL, CRM_DEAL_STAGE_ORDER } from "@/lib/constants";
import type { CrmClient } from "@/types/database";

const initialState: ActionState = {};

export function DealFormDialog({
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
    async (_prev: ActionState, formData: FormData) => createCrmDeal(organizationId, formData),
    initialState
  );

  if (state.success && open) onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New deal</DialogTitle>
          <DialogDescription>Track an opportunity through your pipeline.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="d-title">Title</Label>
            <Input id="d-title" name="title" required autoFocus placeholder="Website redesign" />
          </div>
          <div className="space-y-1.5">
            <Label>Client</Label>
            <Select name="clientId">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No client yet" />
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-value">Value</Label>
              <Input id="d-value" name="value" type="number" min={0} step="0.01" defaultValue={0} />
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select name="stage" defaultValue="lead">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRM_DEAL_STAGE_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {CRM_DEAL_STAGE_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-close">Expected close date</Label>
            <Input id="d-close" name="expectedCloseDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-notes">Notes</Label>
            <Textarea id="d-notes" name="notes" rows={3} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Add deal</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
