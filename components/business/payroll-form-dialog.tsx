"use client";

import { useActionState } from "react";

import { createPayrollRecord, type ActionState } from "@/services/actions/payroll";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import type { OrganizationMemberWithProfile } from "@/types/database";

const initialState: ActionState = {};

export function PayrollFormDialog({
  organizationId,
  members,
  open,
  onOpenChange,
}: {
  organizationId: string;
  members: OrganizationMemberWithProfile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState(
    async (_prev: ActionState, formData: FormData) => createPayrollRecord(organizationId, formData),
    initialState
  );

  if (state.success && open) onOpenChange(false);

  const activeMembers = members.filter((m) => m.status === "active");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Record payroll</DialogTitle>
          <DialogDescription>
            A manual ledger entry — this doesn&apos;t process payment, taxes, or direct deposit.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Team member</Label>
            <Select name="memberId" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick a member" />
              </SelectTrigger>
              <SelectContent>
                {activeMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.profile?.full_name || m.invited_email || "Member"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pr-start">Period start</Label>
              <Input id="pr-start" name="payPeriodStart" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-end">Period end</Label>
              <Input id="pr-end" name="payPeriodEnd" type="date" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-amount">Gross amount</Label>
            <Input id="pr-amount" name="grossAmount" type="number" min={0} step="0.01" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-notes">Notes</Label>
            <Textarea id="pr-notes" name="notes" rows={2} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Record payroll</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
