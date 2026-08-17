import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getAssessments } from "@/services/queries/career";
import { AssessmentsPageClient } from "./assessments-page-client";

export const metadata: Metadata = { title: "Assessments — DevOS" };

export default async function AssessmentsPage() {
  const { supabase, user } = await requireUser();
  const assessments = await getAssessments(supabase, user.id);

  return <AssessmentsPageClient assessments={assessments} />;
}
