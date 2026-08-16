"use client";

import * as React from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCourse } from "@/services/actions/learning";
import { COURSE_PLATFORMS } from "@/lib/constants";

export function CourseFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add course</DialogTitle>
          <DialogDescription>Track something you're learning from any platform.</DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            const res = await createCourse(formData);
            if (res.error) toast.error(res.error);
            else {
              toast.success(res.success);
              onOpenChange(false);
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="c-name">Course name</Label>
            <Input id="c-name" name="name" required autoFocus placeholder="Epic React" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select name="platform" defaultValue="Other">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-instructor">Instructor</Label>
              <Input id="c-instructor" name="instructor" placeholder="Kent C. Dodds" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-url">URL</Label>
            <Input id="c-url" name="url" type="url" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-lessons">Total lessons</Label>
              <Input id="c-lessons" name="totalLessons" type="number" min={1} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-duration">Est. duration (min)</Label>
              <Input id="c-duration" name="estimatedDuration" type="number" min={1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-start">Start date</Label>
              <Input id="c-start" name="startDate" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-target">Target completion</Label>
              <Input id="c-target" name="targetDate" type="date" />
            </div>
          </div>
          <Button type="submit" className="w-full">Add course</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
