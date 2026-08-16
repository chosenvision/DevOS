"use server";

import { requireUser } from "@/services/auth";
import { getActivitySeries, type ActivityRange } from "@/services/queries/analytics";
import { getAnalyticsOverview } from "@/services/queries/analytics-overview";

export async function getActivitySeriesAction(range: ActivityRange) {
  const { supabase, user } = await requireUser();
  return getActivitySeries(supabase, user.id, range);
}

export async function getAnalyticsOverviewAction(range: ActivityRange) {
  const { supabase, user } = await requireUser();
  return getAnalyticsOverview(supabase, user.id, range);
}
