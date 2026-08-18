import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getTimeTrackingSummary } from "@/services/queries/time-tracking";
import { getProjectOptions } from "@/services/queries/projects";
import { getOrCreateUserPreferences } from "@/services/queries/profile";
import { TimerWidget } from "@/components/time-tracking/timer-widget";
import { PomodoroWidget } from "@/components/time-tracking/pomodoro-widget";
import { ManualEntryForm } from "@/components/time-tracking/manual-entry-form";
import { StatsCards } from "@/components/time-tracking/stats-cards";
import { RecentEntries } from "@/components/time-tracking/recent-entries";

export const metadata: Metadata = { title: "Time Tracking — DevOS" };

export default async function TimeTrackingPage() {
  const { supabase, user } = await requireUser();

  const [summary, projects, preferences] = await Promise.all([
    getTimeTrackingSummary(supabase, user.id),
    getProjectOptions(supabase, user.id),
    getOrCreateUserPreferences(supabase, user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Time Tracking</h1>
        <p className="text-sm text-muted-foreground">See where your hours are actually going.</p>
      </div>

      <StatsCards summary={summary} />

      <div className="grid gap-4 lg:grid-cols-3">
        <TimerWidget projects={projects} />
        <PomodoroWidget preferences={preferences} />
        <ManualEntryForm projects={projects} />
      </div>

      <RecentEntries entries={summary.recentEntries} />
    </div>
  );
}
