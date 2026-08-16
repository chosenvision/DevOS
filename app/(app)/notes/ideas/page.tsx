import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getIdeas } from "@/services/queries/notes";
import { IdeasPageClient } from "./ideas-page-client";

export const metadata: Metadata = { title: "Idea Vault — DevOS" };

export default async function IdeasPage() {
  const { supabase, user } = await requireUser();
  const ideas = await getIdeas(supabase, user.id);

  return <IdeasPageClient ideas={ideas} />;
}
