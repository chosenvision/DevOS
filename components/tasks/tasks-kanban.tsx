"use client";

import { toast } from "sonner";

import { KanbanBoard, type KanbanColumn } from "@/components/shared/kanban-board";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateTaskStatus } from "@/services/actions/tasks";
import { PRIORITY_BADGE, PRIORITY_LABEL, TASK_STATUS_LABEL, TASK_STATUS_ORDER } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/database";

const COLUMNS: KanbanColumn[] = TASK_STATUS_ORDER.map((status) => ({
  id: status,
  label: TASK_STATUS_LABEL[status],
}));

export function TasksKanban({ tasks, onSelect }: { tasks: Task[]; onSelect: (task: Task) => void }) {
  return (
    <KanbanBoard
      columns={COLUMNS}
      items={tasks}
      getId={(t) => t.id}
      getColumnId={(t) => t.status}
      onMove={async (id, status) => {
        const res = await updateTaskStatus(id, status as TaskStatus);
        if (res.error) toast.error(res.error);
      }}
      renderCard={(task, dragging) => (
        <Card
          className="cursor-pointer gap-2 py-3 shadow-none hover:border-primary/40"
          onClick={() => !dragging && onSelect(task)}
        >
          <p className="truncate px-3 text-sm font-medium">{task.title}</p>
          <div className="flex items-center justify-between px-3">
            <Badge variant={PRIORITY_BADGE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
            {task.due_date && (
              <span className="text-xs text-muted-foreground">{formatRelativeTime(task.due_date)}</span>
            )}
          </div>
        </Card>
      )}
    />
  );
}
