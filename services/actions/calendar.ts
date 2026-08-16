"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";

export type ActionState = { error?: string; success?: string };

export async function createCalendarEvent(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") || "").trim();
  const startAt = formData.get("startAt") as string;
  if (!title || !startAt) return { error: "Title and date are required." };

  const { error } = await supabase.from("calendar_events").insert({
    user_id: user.id,
    title,
    description: (formData.get("description") as string) || null,
    event_type: (formData.get("eventType") as string) || "custom",
    start_at: new Date(startAt).toISOString(),
    all_day: formData.get("allDay") === "on",
  });

  if (error) return { error: error.message };

  revalidatePath("/calendar");
  return { success: "Event added." };
}

export async function deleteCalendarEvent(eventId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("calendar_events").delete().eq("id", eventId).eq("user_id", user.id);
  revalidatePath("/calendar");
  return { error: error?.message };
}
