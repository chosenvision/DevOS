import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getBookmarks } from "@/services/queries/notes";
import { BookmarksPageClient } from "./bookmarks-page-client";

export const metadata: Metadata = { title: "Bookmarks — DevOS" };

export default async function BookmarksPage() {
  const { supabase, user } = await requireUser();
  const bookmarks = await getBookmarks(supabase, user.id);

  return <BookmarksPageClient bookmarks={bookmarks} />;
}
