import type { SupabaseClient } from "@supabase/supabase-js";

import { daysAgo, bucketByDay } from "@/lib/analytics";
import { RANGE_DAYS, type ActivityRange } from "@/services/queries/analytics";

export interface AnalyticsOverview {
  projectCompletion: { completed: number; total: number };
  taskCompletion: { completed: number; total: number };
  problemsSolvedSeries: { label: string; value: number }[];
  technologiesUsed: { name: string; hours: number }[];
  totalCodingHours: number;
  totalLearningHours: number;
}

export async function getAnalyticsOverview(
  supabase: SupabaseClient,
  userId: string,
  range: ActivityRange
): Promise<AnalyticsOverview> {
  const rangeDays = RANGE_DAYS[range];
  const since = daysAgo(rangeDays).toISOString();

  const [projectsRes, tasksRes, problemsRes, entriesRes] = await Promise.all([
    supabase.from("projects").select("status, created_at").eq("user_id", userId).eq("is_archived", false),
    supabase.from("tasks").select("status, created_at").eq("user_id", userId).gte("created_at", since),
    supabase
      .from("coding_problems")
      .select("status, last_attempted_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("last_attempted_at", since),
    supabase
      .from("time_entries")
      .select("category, duration_minutes, started_at, project:projects(tech_stack)")
      .eq("user_id", userId)
      .gte("started_at", since)
      .not("duration_minutes", "is", null),
  ]);

  const projects = projectsRes.data ?? [];
  const tasks = tasksRes.data ?? [];
  const problems = (problemsRes.data ?? []).filter((p) => p.last_attempted_at);
  const entries = (entriesRes.data ?? []) as unknown as {
    category: string;
    duration_minutes: number;
    started_at: string;
    project: { tech_stack: string[] } | null;
  }[];

  const problemSeries = bucketByDay(
    problems,
    (p) => p.last_attempted_at as string,
    () => 1,
    rangeDays
  );

  const techHours = new Map<string, number>();
  for (const e of entries) {
    for (const tech of e.project?.tech_stack ?? []) {
      techHours.set(tech, (techHours.get(tech) ?? 0) + e.duration_minutes / 60);
    }
  }

  const technologiesUsed = [...techHours.entries()]
    .map(([name, hours]) => ({ name, hours: Math.round(hours * 10) / 10 }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 8);

  const codingMinutes = entries.filter((e) => e.category === "project").reduce((s, e) => s + e.duration_minutes, 0);
  const learningMinutes = entries.filter((e) => e.category === "learning").reduce((s, e) => s + e.duration_minutes, 0);

  return {
    projectCompletion: {
      completed: projects.filter((p) => p.status === "completed").length,
      total: projects.length,
    },
    taskCompletion: {
      completed: tasks.filter((t) => t.status === "completed").length,
      total: tasks.length,
    },
    problemsSolvedSeries: problemSeries.map((p) => ({ label: p.label, value: p.value })),
    technologiesUsed,
    totalCodingHours: Math.round((codingMinutes / 60) * 10) / 10,
    totalLearningHours: Math.round((learningMinutes / 60) * 10) / 10,
  };
}
