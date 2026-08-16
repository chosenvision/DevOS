"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskRow } from "@/components/tasks/task-row";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskSubtask } from "@/types/database";

export function TasksTab({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Task | null>(null);

  const { data: subtasks = [] } = useQuery({
    queryKey: ["subtasks", selected?.id],
    queryFn: async () => {
      if (!selected) return [];
      const supabase = createClient();
      const { data } = await supabase
        .from("task_subtasks")
        .select("*")
        .eq("task_id", selected.id)
        .order("sort_order");
      return (data ?? []) as TaskSubtask[];
    },
    enabled: !!selected,
  });

  const incomplete = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> Add task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet for this project."
          description="Break the work into tasks so progress is easy to track."
          actionLabel="Add task"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          <ul className="divide-y divide-border px-4">
            {incomplete.map((task) => (
              <TaskRow key={task.id} task={task} onClick={() => setSelected(task)} />
            ))}
          </ul>
          {completed.length > 0 && (
            <div className="px-4 py-2">
              <p className="py-2 text-xs font-medium text-muted-foreground">
                Completed ({completed.length})
              </p>
              <ul className="divide-y divide-border">
                {completed.map((task) => (
                  <TaskRow key={task.id} task={task} onClick={() => setSelected(task)} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} projectId={projectId} />
      <TaskDetailSheet task={selected} subtasks={subtasks} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
