"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIORITY_LABEL, TASK_STATUS_LABEL, TASK_STATUS_ORDER } from "@/lib/constants";
import { updateTask, deleteTask, addSubtask, toggleSubtask } from "@/services/actions/tasks";
import { runAction } from "@/lib/action-feedback";
import type { Task, TaskSubtask } from "@/types/database";

interface TaskDetailSheetProps {
  task: Task | null;
  subtasks: TaskSubtask[];
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function TaskDetailSheet({ task, subtasks, onOpenChange, onDeleted }: TaskDetailSheetProps) {
  const [newSubtask, setNewSubtask] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  if (!task) return null;

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onOpenChange(false)}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Task details</SheetTitle>
          <SheetDescription className="sr-only">Edit task details and manage subtasks.</SheetDescription>
        </SheetHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              const res = await updateTask(task.id, formData);
              if (res.error) toast.error(res.error);
              else toast.success("Task updated.");
            });
          }}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="d-title">Title</Label>
            <Input id="d-title" name="title" defaultValue={task.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-desc">Description</Label>
            <Textarea id="d-desc" name="description" defaultValue={task.description ?? ""} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue={task.status}>
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
              <Select name="priority" defaultValue={task.priority}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-due">Due date</Label>
            <Input id="d-due" name="dueDate" type="date" defaultValue={task.due_date?.slice(0, 10) ?? ""} />
          </div>
          <input type="hidden" name="projectId" value={task.project_id ?? ""} />

          <div className="space-y-2 border-t border-border pt-4">
            <Label>Subtasks</Label>
            {subtasks.length > 0 && (
              <ul className="space-y-1.5">
                {subtasks.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={s.is_completed}
                      onCheckedChange={(checked) => runAction(() => toggleSubtask(s.id, !!checked))}
                    />
                    <span className={s.is_completed ? "text-sm text-muted-foreground line-through" : "text-sm"}>
                      {s.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSubtask.trim()) {
                    e.preventDefault();
                    runAction(() => addSubtask(task.id, newSubtask.trim()));
                    setNewSubtask("");
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => {
                  if (newSubtask.trim()) {
                    runAction(() => addSubtask(task.id, newSubtask.trim()));
                    setNewSubtask("");
                  }
                }}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <SheetFooter className="mt-auto flex-row justify-between border-t border-border px-0 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={async () => {
                const res = await runAction(() => deleteTask(task.id));
                if (!res.error) {
                  onDeleted?.();
                  onOpenChange(false);
                }
              }}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
            <Button type="submit" disabled={pending}>
              Save changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
