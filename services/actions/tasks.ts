"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { logActivity } from "@/services/activity";
import { taskSchema } from "@/lib/validations/task";

export type ActionState = { error?: string; success?: string };

export async function createTask(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "todo",
    priority: formData.get("priority") || "medium",
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
    projectId: formData.get("projectId") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    project_id: parsed.data.projectId || null,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    status: parsed.data.status,
    priority: parsed.data.priority,
    category: parsed.data.category ?? null,
    tags,
    due_date: parsed.data.dueDate || null,
    estimated_minutes: parsed.data.estimatedMinutes ? Number(parsed.data.estimatedMinutes) : null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { success: "Task created." };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const { supabase, user } = await requireUser();

  const { data: task } = await supabase.from("tasks").select("title, project_id").eq("id", taskId).single();

  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (!error && task && status === "completed") {
    await logActivity(supabase, {
      userId: user.id,
      entityType: "task",
      entityId: taskId,
      projectId: task.project_id ?? undefined,
      action: "completed",
      message: `Completed task "${task.title}"`,
    });
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { error: error?.message };
}

export async function toggleTaskCompleted(taskId: string, completed: boolean) {
  return updateTaskStatus(taskId, completed ? "completed" : "todo");
}

export async function updateTask(taskId: string, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "todo",
    priority: formData.get("priority") || "medium",
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
    projectId: formData.get("projectId") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await supabase
    .from("tasks")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      category: parsed.data.category ?? null,
      tags,
      project_id: parsed.data.projectId || null,
      due_date: parsed.data.dueDate || null,
      estimated_minutes: parsed.data.estimatedMinutes ? Number(parsed.data.estimatedMinutes) : null,
      completed_at: parsed.data.status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: "Task updated." };
}

export async function deleteTask(taskId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { error: error?.message };
}

export async function addSubtask(taskId: string, title: string) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("task_subtasks").insert({
    task_id: taskId,
    user_id: user.id,
    title,
  });

  revalidatePath("/tasks");
  return { error: error?.message };
}

export async function toggleSubtask(subtaskId: string, completed: boolean) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("task_subtasks")
    .update({ is_completed: completed })
    .eq("id", subtaskId)
    .eq("user_id", user.id);

  revalidatePath("/tasks");
  return { error: error?.message };
}
