import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getCodingProblems } from "@/services/queries/career";
import { CodingPracticePageClient } from "./coding-practice-page-client";

export const metadata: Metadata = { title: "Coding Practice — DevOS" };

export default async function CodingPracticePage() {
  const { supabase, user } = await requireUser();
  const problems = await getCodingProblems(supabase, user.id);

  return <CodingPracticePageClient problems={problems} />;
}
