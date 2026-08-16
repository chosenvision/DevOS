"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { createBug, updateBugStatus } from "@/services/actions/projects";
import { BUG_SEVERITY_LABEL } from "@/lib/constants";
import type { Bug, BugSeverity } from "@/types/database";

const SEVERITY_BADGE: Record<BugSeverity, "muted" | "outline" | "warning" | "destructive"> = {
  low: "muted",
  medium: "outline",
  high: "warning",
  critical: "destructive",
};

export function BugsTab({ projectId, bugs }: { projectId: string; bugs: Bug[] }) {
  const [open, setOpen] = React.useState(false);
  const openBugs = bugs.filter((b) => b.status !== "resolved" && b.status !== "wont_fix");
  const resolvedBugs = bugs.filter((b) => b.status === "resolved" || b.status === "wont_fix");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Report bug
        </Button>
      </div>

      {bugs.length === 0 ? (
        <EmptyState
          title="No bugs logged."
          description="Track issues here as you find them, with repro steps and a fix."
          actionLabel="Report bug"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {[...openBugs, ...resolvedBugs].map((bug) => (
            <Card key={bug.id} className="gap-2 py-3">
              <div className="flex items-start justify-between gap-3 px-4">
                <div className="min-w-0">
                  <p className={`truncate text-sm font-medium ${bug.status === "resolved" ? "text-muted-foreground line-through" : ""}`}>
                    {bug.title}
                  </p>
                  {bug.description && <p className="line-clamp-1 text-xs text-muted-foreground">{bug.description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={SEVERITY_BADGE[bug.severity]}>{BUG_SEVERITY_LABEL[bug.severity]}</Badge>
                  {bug.status !== "resolved" && bug.status !== "wont_fix" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const res = await updateBugStatus(bug.id, "resolved");
                        if (res.error) toast.error(res.error);
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report a bug</DialogTitle>
            <DialogDescription>Capture what happened so it&apos;s easy to reproduce later.</DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              const res = await createBug(projectId, formData);
              if (res.error) toast.error(res.error);
              else setOpen(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="b-title">Title</Label>
              <Input id="b-title" name="title" required autoFocus placeholder="Login button unresponsive on mobile" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-desc">Description</Label>
              <Textarea id="b-desc" name="description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Severity</Label>
                <Select name="severity" defaultValue="medium">
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(BUG_SEVERITY_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-steps">Steps to reproduce</Label>
              <Textarea id="b-steps" name="stepsToReproduce" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="b-expected">Expected result</Label>
                <Textarea id="b-expected" name="expectedResult" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-actual">Actual result</Label>
                <Textarea id="b-actual" name="actualResult" rows={2} />
              </div>
            </div>
            <Button type="submit" className="w-full">Report bug</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
