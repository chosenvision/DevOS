"use server";

import { requireUser } from "@/services/auth";
import { getActivitySeries, type ActivityRange } from "@/services/queries/analytics";

export async function getActivitySeriesAction(range: ActivityRange) {
  const { supabase, user } = await requireUser();
  return getActivitySeries(supabase, user.id, range);
}
