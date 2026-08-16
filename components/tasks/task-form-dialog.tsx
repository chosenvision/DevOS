"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { createTask, type ActionState } from "@/services/actions/tasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { PRIORITY_LABEL, TASK_STATUS_LABEL, TASK_STATUS_ORDER } from "@/lib/constants";

const initialState: ActionState = {};

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  projects?: { id: string; name: string }[];
}

export function TaskFormDialog({ open, onOpenChange, projectId, projects }: TaskFormDialogProps) {
  const [state, formAction] = useActionState(createTask, initialState);

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
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Add something to your list.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="t-title">Title</Label>
            <Input id="t-title" name="title" required autoFocus placeholder="Write the onboarding email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-desc">Description</Label>
            <Textarea id="t-desc" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue="todo">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{TASK_STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-due">Due date</Label>
              <Input id="t-due" name="dueDate" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-est">Estimated minutes</Label>
              <Input id="t-est" name="estimatedMinutes" type="number" min={1} placeholder="60" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Repeat</Label>
            <Select name="recurrenceFrequency" defaultValue="none">
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Does not repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {projectId ? (
            <input type="hidden" name="projectId" value={projectId} />
          ) : projects && projects.length > 0 ? (
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select name="projectId">
                <SelectTrigger className="w-full"><SelectValue placeholder="No project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-category">Category</Label>
              <Input id="t-category" name="category" placeholder="Frontend" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-tags">Tags</Label>
              <Input id="t-tags" name="tags" placeholder="urgent, api" />
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Create task</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
