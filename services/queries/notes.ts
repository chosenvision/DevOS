import type { SupabaseClient } from "@supabase/supabase-js";

import type { Bookmark, CodeSnippet, DailyLog, Idea, Note, NoteFolder } from "@/types/database";

export async function getNotes(supabase: SupabaseClient, userId: string): Promise<Note[]> {
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  return (data as Note[]) ?? [];
}

export async function getNote(supabase: SupabaseClient, userId: string, id: string): Promise<Note | null> {
  const { data } = await supabase.from("notes").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
  return (data as Note) ?? null;
}

export async function getNoteFolders(supabase: SupabaseClient, userId: string): Promise<NoteFolder[]> {
  const { data } = await supabase
    .from("note_folders")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  return (data as NoteFolder[]) ?? [];
}

export async function getDailyLogs(supabase: SupabaseClient, userId: string, limit = 30): Promise<DailyLog[]> {
  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(limit);
  return (data as DailyLog[]) ?? [];
}

export async function getSnippets(supabase: SupabaseClient, userId: string): Promise<CodeSnippet[]> {
  const { data } = await supabase
    .from("code_snippets")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return (data as CodeSnippet[]) ?? [];
}

export async function getIdeas(supabase: SupabaseClient, userId: string): Promise<Idea[]> {
  const { data } = await supabase
    .from("ideas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as Idea[]) ?? [];
}

export async function getBookmarks(supabase: SupabaseClient, userId: string): Promise<Bookmark[]> {
  const { data } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("date_saved", { ascending: false });
  return (data as Bookmark[]) ?? [];
}
