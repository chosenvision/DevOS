import { FolderKanban, CheckSquare, Timer, Flame, GraduationCap, Briefcase, MessagesSquare, GitCommitHorizontal } from "lucide-react";

import { KpiCard, KpiIconChip } from "@/components/dashboard/kpi-card";
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
        tone="primary"
      />
      <KpiCard
        label="Tasks Due Today"
        value={String(summary.tasksDueToday.value)}
        icon={CheckSquare}
        current={summary.tasksDueToday.value}
        previous={summary.tasksDueToday.previous}
        invertTrend
        tone="warning"
      />
      <KpiCard
        label="Coding Hours"
        value={summary.codingHoursThisWeek.value.toFixed(1)}
        suffix="h"
        icon={Timer}
        current={summary.codingHoursThisWeek.value}
        previous={summary.codingHoursThisWeek.previous}
        caption="this week"
        tone="success"
      />
      <Card className="gap-3 py-4 transition-shadow hover:shadow-soft-lg">
        <div className="flex items-center justify-between px-5">
          <span className="text-xs font-medium text-muted-foreground">Coding Streak</span>
          <KpiIconChip icon={Flame} tone="destructive" />
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
        tone="accent"
      />
      <KpiCard
        label="Job Applications"
        value={String(summary.applications.value)}
        icon={Briefcase}
        current={summary.applications.value}
        previous={summary.applications.previous}
        caption="active"
        tone="primary"
      />
      <Card className="gap-3 py-4 transition-shadow hover:shadow-soft-lg">
        <div className="flex items-center justify-between px-5">
          <span className="text-xs font-medium text-muted-foreground">Upcoming Interviews</span>
          <KpiIconChip icon={MessagesSquare} tone="warning" />
        </div>
        <div className="flex items-baseline gap-2 px-5">
          <span className="text-2xl font-semibold tabular-nums">{summary.upcomingInterviews.value}</span>
          <span className="text-xs text-muted-foreground">next 14 days</span>
        </div>
      </Card>
      <Card className="gap-3 py-4 transition-shadow hover:shadow-soft-lg">
        <div className="flex items-center justify-between px-5">
          <span className="text-xs font-medium text-muted-foreground">GitHub Commits</span>
          <KpiIconChip icon={GitCommitHorizontal} tone="accent" />
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
