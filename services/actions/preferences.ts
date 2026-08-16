"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";

export async function updatePomodoroSettings(formData: FormData) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("user_preferences")
    .update({
      pomodoro_focus_minutes: Number(formData.get("focusMinutes")) || 25,
      pomodoro_short_break_minutes: Number(formData.get("shortBreakMinutes")) || 5,
      pomodoro_long_break_minutes: Number(formData.get("longBreakMinutes")) || 15,
      pomodoro_sessions_before_long_break: Number(formData.get("sessionsBeforeLongBreak")) || 4,
    })
    .eq("user_id", user.id);

  revalidatePath("/time-tracking");
  return { error: error?.message };
}

export async function updateNotificationPreferences(formData: FormData) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("user_preferences")
    .update({
      email_notifications: formData.get("emailNotifications") === "on",
      push_notifications: formData.get("pushNotifications") === "on",
      notify_task_due: formData.get("notifyTaskDue") === "on",
      notify_project_deadline: formData.get("notifyProjectDeadline") === "on",
      notify_interview_reminder: formData.get("notifyInterviewReminder") === "on",
      notify_follow_up: formData.get("notifyFollowUp") === "on",
      notify_habit_streak: formData.get("notifyHabitStreak") === "on",
    })
    .eq("user_id", user.id);

  revalidatePath("/settings/notifications");
  return { error: error?.message };
}

export async function updateAiPreferences(formData: FormData) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("user_preferences")
    .update({
      ai_enabled: formData.get("aiEnabled") === "on",
    })
    .eq("user_id", user.id);

  revalidatePath("/settings/ai");
  return { error: error?.message };
}
