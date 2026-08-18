"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { habitSchema, goalSchema } from "@/lib/validations/habit";

export type ActionState = { error?: string; success?: string };

const HABIT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#0ea5e9", "#a855f7"];

export async function createHabit(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = habitSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    targetFrequency: formData.get("targetFrequency") || "daily",
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { count } = await supabase.from("habits").select("id", { count: "exact", head: true }).eq("user_id", user.id);

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    name: parsed.data.name,
    category: parsed.data.category || null,
    target_frequency: parsed.data.targetFrequency,
    color: HABIT_COLORS[(count ?? 0) % HABIT_COLORS.length],
  });

  if (error) return { error: error.message };

  revalidatePath("/analytics/habits");
  return { success: "Habit added." };
}

export async function toggleHabitToday(habitId: string, completed: boolean) {
  const { supabase, user } = await requireUser();
  const today = new Date().toISOString().slice(0, 10);

  if (completed) {
    const { error } = await supabase
      .from("habit_entries")
      .upsert({ habit_id: habitId, user_id: user.id, entry_date: today, is_completed: true }, { onConflict: "habit_id,entry_date" });
    revalidatePath("/analytics/habits");
    return { error: error?.message };
  }

  const { error } = await supabase
    .from("habit_entries")
    .delete()
    .eq("habit_id", habitId)
    .eq("entry_date", today);

  revalidatePath("/analytics/habits");
  return { error: error?.message };
}

export async function deleteHabit(habitId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("habits").update({ archived_at: new Date().toISOString() }).eq("id", habitId).eq("user_id", user.id);
  revalidatePath("/analytics/habits");
  return { error: error?.message };
}

// ---------- Goals ----------

export async function createGoal(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    period: formData.get("period") || "monthly",
    deadline: formData.get("deadline") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category || null,
    period: parsed.data.period,
    deadline: parsed.data.deadline || null,
    status: "in_progress",
  });

  if (error) return { error: error.message };

  revalidatePath("/analytics/goals");
  return { success: "Goal added." };
}

export async function updateGoalProgress(goalId: string, progress: number) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("goals")
    .update({
      progress,
      status: progress >= 100 ? "completed" : "in_progress",
    })
    .eq("id", goalId)
    .eq("user_id", user.id);

  revalidatePath("/analytics/goals");
  return { error: error?.message };
}

export async function deleteGoal(goalId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("goals").delete().eq("id", goalId).eq("user_id", user.id);
  revalidatePath("/analytics/goals");
  return { error: error?.message };
}

// -- Goal milestones -----------------------------------------------------

/** Recomputes a goal's progress from its milestone checklist whenever a milestone changes. */
async function syncGoalProgressFromMilestones(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
  goalId: string
) {
  const { data: milestones } = await supabase
    .from("goal_milestones")
    .select("is_completed")
    .eq("goal_id", goalId)
    .eq("user_id", userId);

  const list = milestones ?? [];
  if (list.length === 0) return;

  const completed = list.filter((m) => m.is_completed).length;
  const progress = Math.round((completed / list.length) * 100);

  await supabase
    .from("goals")
    .update({ progress, status: progress >= 100 ? "completed" : "in_progress" })
    .eq("id", goalId)
    .eq("user_id", userId);
}

export async function createGoalMilestone(goalId: string, title: string): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const trimmed = title.trim();
  if (!trimmed) return { error: "Milestone title is required." };

  const { data: last } = await supabase
    .from("goal_milestones")
    .select("sort_order")
    .eq("goal_id", goalId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("goal_milestones").insert({
    user_id: user.id,
    goal_id: goalId,
    title: trimmed,
    sort_order: (last?.sort_order ?? -1) + 1,
  });

  if (error) return { error: error.message };

  await syncGoalProgressFromMilestones(supabase, user.id, goalId);
  revalidatePath("/analytics/goals");
  return { success: "Milestone added." };
}

export async function toggleGoalMilestone(milestoneId: string, goalId: string, isCompleted: boolean) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("goal_milestones")
    .update({ is_completed: isCompleted })
    .eq("id", milestoneId)
    .eq("user_id", user.id);

  if (!error) await syncGoalProgressFromMilestones(supabase, user.id, goalId);
  revalidatePath("/analytics/goals");
  return { error: error?.message };
}

export async function deleteGoalMilestone(milestoneId: string, goalId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("goal_milestones").delete().eq("id", milestoneId).eq("user_id", user.id);

  if (!error) await syncGoalProgressFromMilestones(supabase, user.id, goalId);
  revalidatePath("/analytics/goals");
  return { error: error?.message };
}
