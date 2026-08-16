"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";

export type ActionState = { error?: string; success?: string };

export async function startTimer(params: {
  projectId?: string;
  taskId?: string;
  category?: string;
  description?: string;
}) {
  const { supabase, user } = await requireUser();

  const { data: running } = await supabase
    .from("time_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_running", true)
    .maybeSingle();

  if (running) {
    await supabase
      .from("time_entries")
      .update({
        is_running: false,
        ended_at: new Date().toISOString(),
      })
      .eq("id", running.id);
  }

  const { error } = await supabase.from("time_entries").insert({
    user_id: user.id,
    project_id: params.projectId || null,
    task_id: params.taskId || null,
    category: params.category || "project",
    description: params.description || null,
    started_at: new Date().toISOString(),
    is_running: true,
    source: "timer",
  });

  revalidatePath("/time-tracking");
  revalidatePath("/dashboard");
  return { error: error?.message };
}

export async function stopTimer(entryId: string) {
  const { supabase, user } = await requireUser();

  const { data: entry } = await supabase
    .from("time_entries")
    .select("started_at")
    .eq("id", entryId)
    .single();

  if (!entry) return { error: "Timer not found." };

  const durationMinutes = Math.max(
    1,
    Math.round((Date.now() - new Date(entry.started_at).getTime()) / 60000)
  );

  const { error } = await supabase
    .from("time_entries")
    .update({
      is_running: false,
      ended_at: new Date().toISOString(),
      duration_minutes: durationMinutes,
    })
    .eq("id", entryId)
    .eq("user_id", user.id);

  revalidatePath("/time-tracking");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return { error: error?.message };
}

export async function createManualTimeEntry(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const projectId = (formData.get("projectId") as string) || null;
  const category = (formData.get("category") as string) || "project";
  const description = (formData.get("description") as string) || null;
  const date = formData.get("date") as string;
  const hours = Number(formData.get("hours") || 0);
  const minutes = Number(formData.get("minutes") || 0);
  const durationMinutes = hours * 60 + minutes;

  if (!date || durationMinutes <= 0) {
    return { error: "Enter a date and a duration greater than zero." };
  }

  const startedAt = new Date(date);
  const endedAt = new Date(startedAt.getTime() + durationMinutes * 60000);

  const { error } = await supabase.from("time_entries").insert({
    user_id: user.id,
    project_id: projectId,
    category,
    description,
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
    duration_minutes: durationMinutes,
    is_running: false,
    source: "manual",
  });

  if (error) return { error: error.message };

  revalidatePath("/time-tracking");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return { success: "Time logged." };
}
