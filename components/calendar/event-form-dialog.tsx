"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { createCalendarEvent, type ActionState } from "@/services/actions/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ActionState = {};

export function EventFormDialog({ open, onOpenChange, defaultDate }: { open: boolean; onOpenChange: (open: boolean) => void; defaultDate?: Date }) {
  const [state, formAction] = useActionState(createCalendarEvent, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  const defaultValue = (defaultDate ?? new Date()).toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
          <DialogDescription>Study sessions, reminders, or anything else custom.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Title</Label>
            <Input id="ev-title" name="title" required autoFocus placeholder="Study SQL joins" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select name="eventType" defaultValue="study_session">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="study_session">Study session</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-start">Date & time</Label>
              <Input id="ev-start" name="startAt" type="datetime-local" required defaultValue={defaultValue} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-desc">Description</Label>
            <Textarea id="ev-desc" name="description" rows={2} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Add event</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
