import { FolderKanban, CheckSquare, Timer, Flame, GraduationCap, Briefcase, MessagesSquare, GitCommitHorizontal } from "lucide-react";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import type { DashboardSummary } from "@/services/queries/dashboard";

export function KpiGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <KpiCard
        label="Active Projects"
        value={String(summary.activeProjects.value)}
        icon={FolderKanban}
        current={summary.activeProjects.value}
        previous={summary.activeProjects.previous}
      />
      <KpiCard
        label="Tasks Due Today"
        value={String(summary.tasksDueToday.value)}
        icon={CheckSquare}
        current={summary.tasksDueToday.value}
        previous={summary.tasksDueToday.previous}
        invertTrend
      />
      <KpiCard
        label="Coding Hours"
        value={summary.codingHoursThisWeek.value.toFixed(1)}
        suffix="h"
        icon={Timer}
        current={summary.codingHoursThisWeek.value}
        previous={summary.codingHoursThisWeek.previous}
        caption="this week"
      />
      <Card className="gap-2 py-4">
        <div className="flex items-center justify-between px-5">
          <span className="text-xs font-medium text-muted-foreground">Coding Streak</span>
          <Flame className="size-4 text-muted-foreground/70" />
        </div>
        <div className="flex items-baseline gap-2 px-5">
          <span className="text-2xl font-semibold tabular-nums">{summary.codingStreak}</span>
          <span className="text-xs text-muted-foreground">{summary.codingStreak === 1 ? "day" : "days"}</span>
        </div>
      </Card>
      <KpiCard
        label="Learning Hours"
        value={summary.learningHoursThisWeek.value.toFixed(1)}
        icon={GraduationCap}
        current={summary.learningHoursThisWeek.value}
        previous={summary.learningHoursThisWeek.previous}
        caption="this week"
      />
      <KpiCard
        label="Job Applications"
        value={String(summary.applications.value)}
        icon={Briefcase}
        current={summary.applications.value}
        previous={summary.applications.previous}
        caption="active"
      />
      <Card className="gap-2 py-4">
        <div className="flex items-center justify-between px-5">
          <span className="text-xs font-medium text-muted-foreground">Upcoming Interviews</span>
          <MessagesSquare className="size-4 text-muted-foreground/70" />
        </div>
        <div className="flex items-baseline gap-2 px-5">
          <span className="text-2xl font-semibold tabular-nums">{summary.upcomingInterviews.value}</span>
          <span className="text-xs text-muted-foreground">next 14 days</span>
        </div>
      </Card>
      <Card className="gap-2 py-4">
        <div className="flex items-center justify-between px-5">
          <span className="text-xs font-medium text-muted-foreground">GitHub Commits</span>
          <GitCommitHorizontal className="size-4 text-muted-foreground/70" />
        </div>
        {summary.githubConnected ? (
          <div className="flex items-baseline gap-2 px-5">
            <span className="text-2xl font-semibold tabular-nums">—</span>
          </div>
        ) : (
          <div className="px-5">
            <a href="/settings/integrations" className="text-xs font-medium text-primary hover:underline">
              Connect GitHub →
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
