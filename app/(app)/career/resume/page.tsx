import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getResumes } from "@/services/queries/career";
import { ResumesPageClient } from "./resumes-page-client";

export const metadata: Metadata = { title: "Resume Studio — DevOS" };

export default async function ResumesPage() {
  const { supabase, user } = await requireUser();
  const resumes = await getResumes(supabase, user.id);

  return <ResumesPageClient resumes={resumes} />;
}
