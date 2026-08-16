"use client";

import * as React from "react";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toggleTaskCompleted } from "@/services/actions/tasks";
import { PRIORITY_BADGE, PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/lib/constants";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Task } from "@/types/database";

export function TaskRow({
  task,
  showProject = false,
  onClick,
}: {
  task: Task;
  showProject?: boolean;
  onClick?: () => void;
}) {
  const [completed, setCompleted] = React.useState(task.status === "completed");
  const [pending, startTransition] = React.useTransition();
  const overdue = task.due_date && new Date(task.due_date) < new Date() && !completed;

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Checkbox
        checked={completed}
        disabled={pending}
        onCheckedChange={(checked) => {
          setCompleted(!!checked);
          startTransition(async () => {
            const res = await toggleTaskCompleted(task.id, !!checked);
            if (res.error) toast.error(res.error);
          });
        }}
      />
      <button type="button" onClick={onClick} className="min-w-0 flex-1 text-left">
        <p className={cn("truncate text-sm", completed && "text-muted-foreground line-through")}>
          {task.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {showProject && task.project && <span className="truncate">{task.project.name}</span>}
          {task.due_date && (
            <span className={cn("flex items-center gap-1", overdue && "text-destructive")}>
              <CalendarDays className="size-3" />
              {formatRelativeTime(task.due_date)}
            </span>
          )}
          {task.status !== "todo" && task.status !== "completed" && (
            <span>{TASK_STATUS_LABEL[task.status]}</span>
          )}
        </div>
      </button>
      <Badge variant={PRIORITY_BADGE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
    </li>
  );
}
