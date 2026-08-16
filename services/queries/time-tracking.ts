import type { SupabaseClient } from "@supabase/supabase-js";

import { daysAgo } from "@/lib/analytics";
import type { TimeEntry } from "@/types/database";

export interface TimeTrackingSummary {
  hoursToday: number;
  hoursWeek: number;
  hoursMonth: number;
  avgDailyFocusMinutes: number;
  mostWorkedProject: { name: string; hours: number } | null;
  mostUsedTechnology: { name: string; hours: number } | null;
  recentEntries: TimeEntry[];
}

export async function getTimeTrackingSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<TimeTrackingSummary> {
  const since30 = daysAgo(30).toISOString();
  const todayStart = daysAgo(0).toISOString();
  const weekStart = daysAgo(7).toISOString();
  const monthStart = daysAgo(30).toISOString();

  const [entriesRes, recentRes] = await Promise.all([
    supabase
      .from("time_entries")
      .select("duration_minutes, started_at, category, project_id, project:projects(name, tech_stack)")
      .eq("user_id", userId)
      .gte("started_at", since30)
      .not("duration_minutes", "is", null),
    supabase
      .from("time_entries")
      .select("*, project:projects(id, name)")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(20),
  ]);

  const entries = (entriesRes.data ?? []) as unknown as {
    duration_minutes: number;
    started_at: string;
    category: string;
    project_id: string | null;
    project: { name: string; tech_stack: string[] } | null;
  }[];

  const sumSince = (since: string) =>
    entries
      .filter((e) => new Date(e.started_at) >= new Date(since))
      .reduce((sum, e) => sum + e.duration_minutes, 0);

  const hoursToday = sumSince(todayStart) / 60;
  const hoursWeek = sumSince(weekStart) / 60;
  const hoursMonth = sumSince(monthStart) / 60;

  const daysWithEntries = new Set(entries.map((e) => e.started_at.slice(0, 10))).size;
  const avgDailyFocusMinutes = daysWithEntries > 0 ? sumSince(monthStart) / daysWithEntries : 0;

  const projectMinutes = new Map<string, number>();
  const techMinutes = new Map<string, number>();

  for (const entry of entries) {
    if (entry.project?.name) {
      projectMinutes.set(entry.project.name, (projectMinutes.get(entry.project.name) ?? 0) + entry.duration_minutes);
      for (const tech of entry.project.tech_stack ?? []) {
        techMinutes.set(tech, (techMinutes.get(tech) ?? 0) + entry.duration_minutes);
      }
    }
  }

  const topProject = [...projectMinutes.entries()].sort((a, b) => b[1] - a[1])[0];
  const topTech = [...techMinutes.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    hoursToday: Math.round(hoursToday * 10) / 10,
    hoursWeek: Math.round(hoursWeek * 10) / 10,
    hoursMonth: Math.round(hoursMonth * 10) / 10,
    avgDailyFocusMinutes: Math.round(avgDailyFocusMinutes),
    mostWorkedProject: topProject ? { name: topProject[0], hours: Math.round((topProject[1] / 60) * 10) / 10 } : null,
    mostUsedTechnology: topTech ? { name: topTech[0], hours: Math.round((topTech[1] / 60) * 10) / 10 } : null,
    recentEntries: (recentRes.data as unknown as TimeEntry[]) ?? [],
  };
}
