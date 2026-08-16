"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { createManualTimeEntry, type ActionState } from "@/services/actions/time-entries";

const initialState: ActionState = {};

export function ManualEntryForm({ projects }: { projects: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(createManualTimeEntry, initialState);

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">Log time manually</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-date">Date</Label>
              <Input id="m-date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select name="category" defaultValue="project">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="interview_prep">Interview prep</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-hours">Hours</Label>
              <Input id="m-hours" name="hours" type="number" min={0} max={24} defaultValue={0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-minutes">Minutes</Label>
              <Input id="m-minutes" name="minutes" type="number" min={0} max={59} defaultValue={30} />
            </div>
          </div>
          {projects.length > 0 && (
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
          )}
          <div className="space-y-1.5">
            <Label htmlFor="m-desc">Description</Label>
            <Input id="m-desc" name="description" placeholder="What did you work on?" />
          </div>
          <SubmitButton>Log time</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
