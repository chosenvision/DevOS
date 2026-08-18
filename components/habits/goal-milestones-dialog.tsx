"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createGoalMilestone, toggleGoalMilestone, deleteGoalMilestone } from "@/services/actions/habits";
import { cn } from "@/lib/utils";
import type { Goal } from "@/types/database";

export function GoalMilestonesDialog({
  goal,
  open,
  onOpenChange,
}: {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [newMilestone, setNewMilestone] = React.useState("");
  const milestones = goal.milestones ?? [];

  function handleAdd() {
    const title = newMilestone.trim();
    if (!title) return;
    createGoalMilestone(goal.id, title);
    setNewMilestone("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal.title} — Milestones</DialogTitle>
          <DialogDescription>Checking milestones off updates the goal&apos;s overall progress automatically.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {milestones.length > 0 && (
            <ul className="max-h-72 space-y-1.5 overflow-y-auto">
              {milestones.map((m) => (
                <li key={m.id} className="group flex items-center gap-2">
                  <Checkbox
                    checked={m.is_completed}
                    onCheckedChange={(checked) => toggleGoalMilestone(m.id, goal.id, checked === true)}
                  />
                  <span className={cn("flex-1 text-sm", m.is_completed && "text-muted-foreground line-through")}>
                    {m.title}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-6 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteGoalMilestone(m.id, goal.id)}
                    aria-label="Delete milestone"
                  >
                    <X className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              placeholder="Add a milestone"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button type="button" size="icon" variant="outline" onClick={handleAdd} aria-label="Add milestone">
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
