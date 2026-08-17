import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import {
  getDashboardSummary,
  getTodayData,
  getCurrentProject,
  getProductivityScore,
} from "@/services/queries/dashboard";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { TodaySection } from "@/components/dashboard/today-section";
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart";
import { CurrentProjectCard } from "@/components/dashboard/current-project-card";
import { ProductivityScore } from "@/components/dashboard/productivity-score";

export const metadata: Metadata = { title: "Dashboard — DevOS" };

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const [summary, today, currentProject, productivity] = await Promise.all([
    getDashboardSummary(supabase, user.id),
    getTodayData(supabase, user.id),
    getCurrentProject(supabase, user.id),
    getProductivityScore(supabase, user.id),
  ]);

  const name = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <WelcomeHeader name={name} />
      <KpiGrid summary={summary} />
      <TodaySection data={today} />
      <WeeklyActivityChart />
      <div className="grid gap-4 lg:grid-cols-2">
        <CurrentProjectCard data={currentProject} />
        <ProductivityScore score={productivity.score} />
      </div>
    </div>
  );
}
