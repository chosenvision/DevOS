"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { createMilestone, updateMilestoneStatus } from "@/services/actions/projects";
import { formatShortDate } from "@/lib/utils";
import type { ProjectMilestone } from "@/types/database";

export function MilestonesTab({ projectId, milestones }: { projectId: string; milestones: ProjectMilestone[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add milestone
        </Button>
      </div>

      {milestones.length === 0 ? (
        <EmptyState
          title="No milestones yet."
          description="Break the project into stages — research, design, build, test, ship."
          actionLabel="Add milestone"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {milestones.map((m) => (
            <Card key={m.id} className="gap-2 py-3">
              <div className="flex items-center justify-between gap-3 px-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.title}</p>
                  {m.description && <p className="truncate text-xs text-muted-foreground">{m.description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {m.target_date && (
                    <span className="text-xs text-muted-foreground">{formatShortDate(m.target_date)}</span>
                  )}
                  {m.status === "completed" ? (
                    <Badge variant="success">Completed</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const res = await updateMilestoneStatus(m.id, "completed");
                        if (res.error) toast.error(res.error);
                      }}
                    >
                      <Check className="size-3.5" /> Mark done
                    </Button>
                  )}
                </div>
              </div>
              <div className="px-4">
                <Progress value={m.status === "completed" ? 100 : m.progress} className="h-1" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New milestone</DialogTitle>
            <DialogDescription>Give this stage a name and a target date.</DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              const res = await createMilestone(projectId, formData);
              if (res.error) toast.error(res.error);
              else setOpen(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="m-title">Title</Label>
              <Input id="m-title" name="title" required autoFocus placeholder="Frontend build" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-desc">Description</Label>
              <Textarea id="m-desc" name="description" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-date">Target date</Label>
              <Input id="m-date" name="targetDate" type="date" />
            </div>
            <Button type="submit" className="w-full">Add milestone</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
