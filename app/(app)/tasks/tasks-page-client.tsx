"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { MonthCalendar } from "@/components/shared/month-calendar";
import { TaskRow } from "@/components/tasks/task-row";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TasksKanban } from "@/components/tasks/tasks-kanban";
import { TasksFilterBar, type TaskFilters } from "@/components/tasks/tasks-filter-bar";
import { createClient } from "@/lib/supabase/client";
import { isSameDay } from "@/lib/analytics";
import { formatShortDate } from "@/lib/utils";
import type { Task, TaskSubtask } from "@/types/database";

const DEFAULT_FILTERS: TaskFilters = { search: "", projectId: "all", priority: "all", status: "all" };

function applyFilters(tasks: Task[], filters: TaskFilters) {
  return tasks.filter((t) => {
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.projectId === "none" && t.project_id) return false;
    if (filters.projectId !== "all" && filters.projectId !== "none" && t.project_id !== filters.projectId) return false;
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.status !== "all" && t.status !== filters.status) return false;
    return true;
  });
}

export function TasksPageClient({ tasks, projects }: { tasks: Task[]; projects: { id: string; name: string }[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Task | null>(null);
  const [filters, setFilters] = React.useState<TaskFilters>(DEFAULT_FILTERS);
  const [subtasks, setSubtasks] = React.useState<TaskSubtask[]>([]);

  React.useEffect(() => {
    if (!selected) return;
    const supabase = createClient();
    supabase
      .from("task_subtasks")
      .select("*")
      .eq("task_id", selected.id)
      .order("sort_order")
      .then(({ data }) => setSubtasks((data as TaskSubtask[]) ?? []));
  }, [selected]);

  const incomplete = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");

  const today = incomplete.filter((t) => t.due_date && isSameDay(t.due_date, new Date()));
  const overdue = incomplete.filter((t) => t.due_date && new Date(t.due_date) < new Date() && !isSameDay(t.due_date, new Date()));
  const upcoming = incomplete
    .filter((t) => t.due_date && new Date(t.due_date) > new Date() && !isSameDay(t.due_date, new Date()))
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  const filtered = applyFilters(tasks, filters);

  const calendarItems = tasks
    .filter((t) => t.due_date)
    .map((t) => ({
      id: t.id,
      date: t.due_date as string,
      render: (
        <button
          onClick={() => setSelected(t)}
          className={`w-full truncate rounded px-1 text-left text-[11px] ${t.status === "completed" ? "text-muted-foreground line-through" : "bg-primary/10 text-primary"}`}
        >
          {t.title}
        </button>
      ),
    }));

  if (tasks.length === 0) {
    return (
      <>
        <EmptyState
          title="You don't have any tasks yet."
          description="Add your first task and start checking things off."
          actionLabel="Create Task"
          onAction={() => setDialogOpen(true)}
        />
        <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} projects={projects} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> New task
        </Button>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="today" className="space-y-6">
            {overdue.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-destructive">Overdue ({overdue.length})</p>
                <ul className="divide-y divide-border rounded-lg border border-border px-4">
                  {overdue.map((t) => (
                    <TaskRow key={t.id} task={t} showProject showFocus onClick={() => setSelected(t)} />
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Due today</p>
              {today.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Nothing due today.</p>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border px-4">
                  {today.map((t) => (
                    <TaskRow key={t.id} task={t} showProject showFocus onClick={() => setSelected(t)} />
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nothing on the horizon.</p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border px-4">
                {upcoming.map((t) => (
                  <TaskRow key={t.id} task={t} showProject showFocus onClick={() => setSelected(t)} />
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <TasksFilterBar filters={filters} onChange={setFilters} projects={projects} />
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No tasks match your filters.</p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border px-4">
                {filtered.map((t) => (
                  <TaskRow key={t.id} task={t} showProject showFocus onClick={() => setSelected(t)} />
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="kanban">
            <TasksKanban tasks={incomplete} onSelect={setSelected} />
          </TabsContent>

          <TabsContent value="calendar">
            <MonthCalendar items={calendarItems} />
          </TabsContent>

          <TabsContent value="completed">
            {completed.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nothing completed yet.</p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border px-4">
                {completed.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground line-through">{t.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {t.completed_at ? formatShortDate(t.completed_at) : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </div>
      </Tabs>

      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} projects={projects} />
      <TaskDetailSheet task={selected} subtasks={subtasks} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
