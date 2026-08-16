import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getApplications, getApplicationAnalytics } from "@/services/queries/career";
import { ApplicationsPageClient } from "./applications-page-client";

export const metadata: Metadata = { title: "Applications — DevOS" };

export default async function ApplicationsPage() {
  const { supabase, user } = await requireUser();
  const [applications, analytics] = await Promise.all([
    getApplications(supabase, user.id),
    getApplicationAnalytics(supabase, user.id),
  ]);

  return <ApplicationsPageClient applications={applications} analytics={analytics} />;
}
