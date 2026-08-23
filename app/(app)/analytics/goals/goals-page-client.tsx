"use client";

import * as React from "react";
import { toast } from "sonner";
import { ListChecks, Minus, Plus, Target, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { GoalMilestonesDialog } from "@/components/habits/goal-milestones-dialog";
import { createGoal, updateGoalProgress, deleteGoal } from "@/services/actions/habits";
import { runAction } from "@/lib/action-feedback";
import { GOAL_STATUS_LABEL } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { Goal, GoalPeriod } from "@/types/database";

const PERIOD_LABEL: Record<GoalPeriod, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

function GoalCard({ goal }: { goal: Goal }) {
  const [milestonesOpen, setMilestonesOpen] = React.useState(false);
  const hasMilestones = (goal.milestones?.length ?? 0) > 0;

  return (
    <Card className="gap-2 py-3">
      <div className="flex items-start justify-between gap-2 px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{goal.title}</p>
          {goal.category && <p className="text-xs text-muted-foreground">{goal.category}</p>}
        </div>
        <Button size="icon" variant="ghost" className="size-6" onClick={() => runAction(() => deleteGoal(goal.id))} aria-label="Delete goal">
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <div className="px-4">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>{GOAL_STATUS_LABEL[goal.status]}</span>
          <span>{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} />
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          {hasMilestones ? (
            <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-xs" onClick={() => setMilestonesOpen(true)}>
              <ListChecks className="size-3" />
              {goal.milestones!.filter((m) => m.is_completed).length}/{goal.milestones!.length}
            </Button>
          ) : (
            <>
              <Button size="icon" variant="outline" className="size-6" onClick={() => runAction(() => updateGoalProgress(goal.id, Math.max(0, goal.progress - 10)))} aria-label="Decrease progress">
                <Minus className="size-3" />
              </Button>
              <Button size="icon" variant="outline" className="size-6" onClick={() => runAction(() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 10)))} aria-label="Increase progress">
                <Plus className="size-3" />
              </Button>
              <Button size="icon" variant="ghost" className="size-6" onClick={() => setMilestonesOpen(true)} aria-label="Manage milestones">
                <ListChecks className="size-3" />
              </Button>
            </>
          )}
        </div>
        {goal.deadline && <span className="text-xs text-muted-foreground">Due {formatShortDate(goal.deadline)}</span>}
      </div>
      <GoalMilestonesDialog goal={goal} open={milestonesOpen} onOpenChange={setMilestonesOpen} />
    </Card>
  );
}

export function GoalsPageClient({ goals }: { goals: Goal[] }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createGoal({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  if (goals.length === 0) {
    return (
      <>
        <EmptyState title="No goals set yet." description="Set weekly, monthly, quarterly, or yearly goals." actionLabel="New goal" onAction={() => setOpen(true)} icon={Target} />
        <GoalDialog open={open} onOpenChange={setOpen} formAction={formAction} error={error} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New goal
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {(Object.keys(PERIOD_LABEL) as GoalPeriod[]).map((p) => (
            <TabsTrigger key={p} value={p}>{PERIOD_LABEL[p]}</TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <TabsContent value="all" className="contents">
            {goals.map((g) => <GoalCard key={g.id} goal={g} />)}
          </TabsContent>
          {(Object.keys(PERIOD_LABEL) as GoalPeriod[]).map((p) => (
            <TabsContent key={p} value={p} className="contents">
              {goals.filter((g) => g.period === p).map((g) => <GoalCard key={g.id} goal={g} />)}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <GoalDialog open={open} onOpenChange={setOpen} formAction={formAction} error={error} />
    </div>
  );
}

function GoalDialog({
  open,
  onOpenChange,
  formAction,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formAction: (formData: FormData) => void;
  error?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New goal</DialogTitle>
          <DialogDescription>Set a goal for a period and track progress toward it.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="g-title">Goal</Label>
            <Input id="g-title" name="title" required autoFocus placeholder="Ship the portfolio site" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-desc">Description</Label>
            <Textarea id="g-desc" name="description" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Period</Label>
              <Select name="period" defaultValue="monthly">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PERIOD_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-deadline">Deadline</Label>
              <Input id="g-deadline" name="deadline" type="date" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Create goal</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
