import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";

export const metadata: Metadata = { title: "Analytics — DevOS" };

export default async function AnalyticsPage() {
  const { supabase, user } = await requireUser();
  const { data: github } = await supabase
    .from("github_connections")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return <AnalyticsCharts githubConnected={!!github} />;
}
