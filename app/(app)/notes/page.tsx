import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getNotes } from "@/services/queries/notes";
import { NotesPageClient } from "./notes-page-client";

export const metadata: Metadata = { title: "Notes — DevOS" };

export default async function NotesPage() {
  const { supabase, user } = await requireUser();
  const notes = await getNotes(supabase, user.id);

  return <NotesPageClient notes={notes} />;
}
