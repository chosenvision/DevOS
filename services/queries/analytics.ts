import type { SupabaseClient } from "@supabase/supabase-js";

import { bucketByDay, daysAgo } from "@/lib/analytics";

export type ActivityRange = "7d" | "30d" | "3m" | "1y";

export const RANGE_DAYS: Record<ActivityRange, number> = {
  "7d": 7,
  "30d": 30,
  "3m": 90,
  "1y": 365,
};

export interface ActivitySeriesPoint {
  date: string;
  label: string;
  codingHours: number;
  studyHours: number;
  tasksCompleted: number;
}

/** Aggregates time entries + completed tasks into one daily series for the given range. */
export async function getActivitySeries(
  supabase: SupabaseClient,
  userId: string,
  range: ActivityRange
): Promise<ActivitySeriesPoint[]> {
  const rangeDays = RANGE_DAYS[range];
  const since = daysAgo(rangeDays).toISOString();

  const [entriesRes, tasksRes] = await Promise.all([
    supabase
      .from("time_entries")
      .select("category, duration_minutes, started_at")
      .eq("user_id", userId)
      .gte("started_at", since),
    supabase
      .from("tasks")
      .select("completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .gte("completed_at", since),
  ]);

  const entries = entriesRes.data ?? [];
  const tasks = tasksRes.data ?? [];

  const codingEntries = entries.filter((e) => e.category === "project");
  const studyEntries = entries.filter((e) => e.category === "learning");

  const coding = bucketByDay(codingEntries, (e) => e.started_at, (e) => (e.duration_minutes ?? 0) / 60, rangeDays);
  const study = bucketByDay(studyEntries, (e) => e.started_at, (e) => (e.duration_minutes ?? 0) / 60, rangeDays);
  const completed = bucketByDay(tasks, (t) => t.completed_at as string, () => 1, rangeDays);

  return coding.map((point, i) => ({
    date: point.date,
    label: point.label,
    codingHours: Math.round(point.value * 10) / 10,
    studyHours: Math.round(study[i].value * 10) / 10,
    tasksCompleted: completed[i].value,
  }));
}
