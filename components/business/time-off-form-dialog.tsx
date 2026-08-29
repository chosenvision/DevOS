"use client";

import * as React from "react";

import { createTimeOffRequest } from "@/services/actions/payroll";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIME_OFF_TYPE_LABEL } from "@/lib/constants";
import type { TimeOffType } from "@/types/database";

const TYPES: TimeOffType[] = ["vacation", "sick", "unpaid"];

export function TimeOffFormDialog({
  organizationId,
  open,
  onOpenChange,
}: {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [type, setType] = React.useState<TimeOffType>("vacation");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await createTimeOffRequest(organizationId, { startDate, endDate, type, notes: notes || undefined });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setStartDate("");
    setEndDate("");
    setNotes("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Request time off</DialogTitle>
          <DialogDescription>An admin will approve or deny this.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="to-start">Start</Label>
              <Input id="to-start" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to-end">End</Label>
              <Input id="to-end" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as TimeOffType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIME_OFF_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to-notes">Notes</Label>
            <Textarea id="to-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
