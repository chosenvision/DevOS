"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { noteSchema } from "@/lib/validations/note";

export type ActionState = { error?: string; success?: string; id?: string };

export async function createNote(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = noteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || "",
    type: formData.get("type") || "general",
    tags: formData.get("tags") || undefined,
    projectId: formData.get("projectId") || undefined,
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
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notes");
  return { success: "Note created.", id: data?.id };
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
