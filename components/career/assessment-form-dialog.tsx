"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createAssessment } from "@/services/actions/career";
import { ASSESSMENT_TYPE_LABEL } from "@/lib/constants";

export function AssessmentFormDialog() {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createAssessment({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add assessment
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New assessment</DialogTitle>
          <DialogDescription>
            Set a deadline and DevOS creates a linked task so it also shows up in Tasks.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="as-company">Company</Label>
              <Input id="as-company" name="companyName" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="as-role">Role</Label>
              <Input id="as-role" name="role" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select name="assessmentType" defaultValue="other">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSESSMENT_TYPE_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="as-platform">Platform</Label>
              <Input id="as-platform" name="platform" placeholder="HackerRank, Codility..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="as-deadline">Deadline</Label>
              <Input id="as-deadline" name="deadline" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="as-url">Link</Label>
              <Input id="as-url" name="url" type="url" placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="as-notes">Notes</Label>
            <Textarea id="as-notes" name="notes" rows={3} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Add assessment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
