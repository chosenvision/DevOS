"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { createApplication, type ActionState } from "@/services/actions/career";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { APPLICATION_STATUS_LABEL, APPLICATION_STATUS_ORDER } from "@/lib/constants";

const initialState: ActionState = {};

export function ApplicationFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [state, formAction] = useActionState(createApplication, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add application</DialogTitle>
          <DialogDescription>Track a role you&apos;re applying to or already applied for.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="a-company">Company</Label>
              <Input id="a-company" name="companyName" required autoFocus placeholder="Acme Inc." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-position">Position</Label>
              <Input id="a-position" name="position" required placeholder="Frontend Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="a-location">Location</Label>
              <Input id="a-location" name="location" placeholder="Remote" />
            </div>
            <div className="space-y-1.5">
              <Label>Work mode</Label>
              <Select name="workMode">
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="a-salary-min">Salary min</Label>
              <Input id="a-salary-min" name="salaryMin" type="number" min={0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-salary-max">Salary max</Label>
              <Input id="a-salary-max" name="salaryMax" type="number" min={0} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-url">Job URL</Label>
            <Input id="a-url" name="jobUrl" type="url" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue="saved">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-date">Date applied</Label>
              <Input id="a-date" name="dateApplied" type="date" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-source">Source</Label>
            <Input id="a-source" name="source" placeholder="LinkedIn, referral, company site..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-notes">Notes</Label>
            <Textarea id="a-notes" name="notes" rows={2} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Add application</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
