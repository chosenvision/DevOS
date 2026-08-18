"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { noteSchema } from "@/lib/validations/note";
import { dailyLogSchema } from "@/lib/validations/journal";

export type ActionState = { error?: string; success?: string; id?: string };

export async function createNote(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = noteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || "",
    type: formData.get("type") || "general",
    tags: formData.get("tags") || undefined,
    projectId: formData.get("projectId") || undefined,
    folderId: (() => {
      const raw = formData.get("folderId");
      return raw && raw !== "none" ? raw : undefined;
    })(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      type: parsed.data.type,
      tags,
      project_id: parsed.data.projectId || null,
      folder_id: parsed.data.folderId || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notes");
  return { success: "Note created.", id: data?.id };
}

// -- Note folders --------------------------------------------------------

export async function createNoteFolder(name: string): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const trimmed = name.trim();
  if (!trimmed) return { error: "Folder name is required." };

  const { data: last } = await supabase
    .from("note_folders")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("note_folders").insert({
    user_id: user.id,
    name: trimmed,
    sort_order: (last?.sort_order ?? -1) + 1,
  });

  if (error) return { error: error.message };
  revalidatePath("/notes");
  return { success: "Folder created." };
}

export async function renameNoteFolder(folderId: string, name: string) {
  const { supabase, user } = await requireUser();
  const trimmed = name.trim();
  if (!trimmed) return { error: "Folder name is required." };

  const { error } = await supabase
    .from("note_folders")
    .update({ name: trimmed })
    .eq("id", folderId)
    .eq("user_id", user.id);

  revalidatePath("/notes");
  return { error: error?.message };
}

/** Deleting a folder unfiles its notes rather than deleting them (folder_id references note_folders ON DELETE SET NULL). */
export async function deleteNoteFolder(folderId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("note_folders").delete().eq("id", folderId).eq("user_id", user.id);
  revalidatePath("/notes");
  return { error: error?.message };
}

export async function moveNoteToFolder(noteId: string, folderId: string | null) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("notes")
    .update({ folder_id: folderId })
    .eq("id", noteId)
    .eq("user_id", user.id);

  revalidatePath("/notes");
  return { error: error?.message };
}

export async function updateNote(noteId: string, updates: { title?: string; content?: string; tags?: string[] }) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", noteId)
    .eq("user_id", user.id);

  revalidatePath("/notes");
  return { error: error?.message };
}

export async function toggleNoteFlag(noteId: string, field: "is_pinned" | "is_favorite" | "is_archived", value: boolean) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("notes")
    .update({ [field]: value })
    .eq("id", noteId)
    .eq("user_id", user.id);

  revalidatePath("/notes");
  return { error: error?.message };
}

export async function deleteNote(noteId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id);

  revalidatePath("/notes");
  return { error: error?.message };
}

// -- Daily Journal ---------------------------------------------------------

/** Creates or updates the entry for a given date — daily_logs has a unique (user_id, log_date) constraint. */
export async function upsertDailyLog(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = dailyLogSchema.safeParse({
    logDate: formData.get("logDate"),
    whatWorkedOn: formData.get("whatWorkedOn") || undefined,
    whatLearned: formData.get("whatLearned") || undefined,
    blockers: formData.get("blockers") || undefined,
    tomorrowPlan: formData.get("tomorrowPlan") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("daily_logs").upsert(
    {
      user_id: user.id,
      log_date: parsed.data.logDate,
      what_worked_on: parsed.data.whatWorkedOn || null,
      what_learned: parsed.data.whatLearned || null,
      blockers: parsed.data.blockers || null,
      tomorrow_plan: parsed.data.tomorrowPlan || null,
    },
    { onConflict: "user_id,log_date" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notes/journal");
  return { success: "Journal entry saved." };
}
