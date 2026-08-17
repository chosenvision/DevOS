import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getJobListings, getJobSearches } from "@/services/queries/career";
import { JobSearchPageClient } from "./job-search-page-client";

export const metadata: Metadata = { title: "Job Search — DevOS" };

export default async function JobSearchPage() {
  const { supabase, user } = await requireUser();
  const [listings, searches] = await Promise.all([
    getJobListings(supabase, user.id),
    getJobSearches(supabase, user.id),
  ]);

  return <JobSearchPageClient listings={listings} searches={searches} />;
}
