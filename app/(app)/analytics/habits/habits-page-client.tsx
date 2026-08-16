"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Flame, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { HabitHeatmap } from "@/components/analytics/habit-heatmap";
import { createHabit, toggleHabitToday, deleteHabit, type ActionState } from "@/services/actions/habits";
import type { HabitWithStats } from "@/services/queries/habits";

const initialState: ActionState = {};

export function HabitsPageClient({ habits }: { habits: HabitWithStats[] }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState(createHabit, initialState);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    }
  }, [state]);

  if (habits.length === 0) {
    return (
      <>
        <EmptyState
          title="No habits tracked yet."
          description="Code, LeetCode, learn, read docs — track the small things that compound."
          actionLabel="Add habit"
          onAction={() => setOpen(true)}
          icon={Flame}
        />
        <HabitDialog open={open} onOpenChange={setOpen} formAction={formAction} state={state} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add habit
        </Button>
      </div>

      <div className="space-y-3">
        {habits.map((habit) => {
          const doneToday = habit.entries.some((e) => e.entry_date === today && e.is_completed);
          return (
            <Card key={habit.id} className="gap-3 py-4">
              <div className="flex items-center justify-between gap-3 px-5">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    checked={doneToday}
                    onCheckedChange={(checked) => toggleHabitToday(habit.id, !!checked)}
                  />
                  <div>
                    <p className="text-sm font-medium">{habit.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {habit.currentStreak} day streak · longest {habit.longestStreak} · {habit.completionRate}% (90d)
                    </p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="size-7" onClick={() => deleteHabit(habit.id)} aria-label="Archive habit">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <div className="px-5">
                <HabitHeatmap entries={habit.entries} color={habit.color} />
              </div>
            </Card>
          );
        })}
      </div>

      <HabitDialog open={open} onOpenChange={setOpen} formAction={formAction} state={state} />
    </div>
  );
}

function HabitDialog({
  open,
  onOpenChange,
  formAction,
  state,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formAction: (formData: FormData) => void;
  state: ActionState;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add habit</DialogTitle>
          <DialogDescription>Something small you want to do consistently.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hb-name">Habit</Label>
            <Input id="hb-name" name="name" required autoFocus placeholder="Solve a LeetCode problem" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hb-category">Category</Label>
              <Input id="hb-category" name="category" placeholder="Coding practice" />
            </div>
            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select name="targetFrequency" defaultValue="daily">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full">Add habit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
