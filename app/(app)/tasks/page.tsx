import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getTasks } from "@/services/queries/tasks";
import { getProjectOptions } from "@/services/queries/projects";
import { TasksPageClient } from "./tasks-page-client";

export const metadata: Metadata = { title: "Tasks — DevOS" };

export default async function TasksPage() {
  const { supabase, user } = await requireUser();
  const [tasks, projects] = await Promise.all([
    getTasks(supabase, user.id),
    getProjectOptions(supabase, user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">Everything on your plate, organized by when it matters.</p>
      </div>
      <TasksPageClient tasks={tasks} projects={projects} />
    </div>
  );
}
