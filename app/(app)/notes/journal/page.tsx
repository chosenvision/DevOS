import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getDailyLogs } from "@/services/queries/notes";
import { JournalPageClient } from "./journal-page-client";

export const metadata: Metadata = { title: "Journal — DevOS" };

export default async function JournalPage() {
  const { supabase, user } = await requireUser();
  const logs = await getDailyLogs(supabase, user.id);

  return <JournalPageClient logs={logs} />;
}
