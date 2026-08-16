import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getNote } from "@/services/queries/notes";
import { NoteEditor } from "@/components/notes/note-editor";

export const metadata: Metadata = { title: "Note — DevOS" };

export default async function NoteDetailPage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const note = await getNote(supabase, user.id, id);

  if (!note) notFound();

  return <NoteEditor note={note} />;
}
