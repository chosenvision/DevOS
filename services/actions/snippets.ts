"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { snippetSchema, bookmarkSchema } from "@/lib/validations/snippet";

export type ActionState = { error?: string; success?: string };

export async function createSnippet(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = snippetSchema.safeParse({
    title: formData.get("title"),
    language: formData.get("language"),
    description: formData.get("description") || undefined,
    code: formData.get("code"),
    tags: formData.get("tags") || undefined,
    category: formData.get("category") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from("code_snippets").insert({
    user_id: user.id,
    title: parsed.data.title,
    language: parsed.data.language,
    description: parsed.data.description || null,
    code: parsed.data.code,
    tags,
    category: parsed.data.category || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/notes/snippets");
  return { success: "Snippet saved." };
}

export async function toggleSnippetFavorite(snippetId: string, favorite: boolean) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("code_snippets")
    .update({ is_favorite: favorite })
    .eq("id", snippetId)
    .eq("user_id", user.id);

  revalidatePath("/notes/snippets");
  return { error: error?.message };
}

export async function deleteSnippet(snippetId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("code_snippets").delete().eq("id", snippetId).eq("user_id", user.id);
  revalidatePath("/notes/snippets");
  return { error: error?.message };
}

export async function createBookmark(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = bookmarkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  let website: string | null = null;
  try {
    website = new URL(parsed.data.url).hostname;
  } catch {
    website = null;
  }

  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    title: parsed.data.title,
    url: parsed.data.url,
    website,
    category: parsed.data.category || null,
    tags,
  });

  if (error) return { error: error.message };

  revalidatePath("/notes/bookmarks");
  return { success: "Bookmark saved." };
}

export async function deleteBookmark(bookmarkId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("bookmarks").delete().eq("id", bookmarkId).eq("user_id", user.id);
  revalidatePath("/notes/bookmarks");
  return { error: error?.message };
}
