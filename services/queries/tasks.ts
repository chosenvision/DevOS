import type { SupabaseClient } from "@supabase/supabase-js";

import type { Task, TaskSubtask } from "@/types/database";

export async function getTasks(supabase: SupabaseClient, userId: string): Promise<Task[]> {
  const { data } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name, slug)")
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (data as unknown as Task[]) ?? [];
}

export async function getTaskWithSubtasks(
  supabase: SupabaseClient,
  userId: string,
  taskId: string
): Promise<{ task: Task; subtasks: TaskSubtask[] } | null> {
  const { data: task } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name, slug)")
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!task) return null;

  const { data: subtasks } = await supabase
    .from("task_subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("sort_order");

  return { task: task as unknown as Task, subtasks: (subtasks as TaskSubtask[]) ?? [] };
}
