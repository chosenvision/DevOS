import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getSnippets } from "@/services/queries/notes";
import { SnippetsPageClient } from "./snippets-page-client";

export const metadata: Metadata = { title: "Snippets — DevOS" };

export default async function SnippetsPage() {
  const { supabase, user } = await requireUser();
  const snippets = await getSnippets(supabase, user.id);

  return <SnippetsPageClient snippets={snippets} />;
}
