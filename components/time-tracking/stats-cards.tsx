import { Clock, TrendingUp, FolderKanban, Code2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";
import type { TimeTrackingSummary } from "@/services/queries/time-tracking";

export function StatsCards({ summary }: { summary: TimeTrackingSummary }) {
  const items = [
    { label: "Hours today", value: `${summary.hoursToday}h`, icon: Clock },
    { label: "Hours this week", value: `${summary.hoursWeek}h`, icon: Clock },
    { label: "Hours this month", value: `${summary.hoursMonth}h`, icon: Clock },
    { label: "Avg daily focus", value: formatDuration(summary.avgDailyFocusMinutes), icon: TrendingUp },
    {
      label: "Most worked project",
      value: summary.mostWorkedProject?.name ?? "—",
      icon: FolderKanban,
      caption: summary.mostWorkedProject ? `${summary.mostWorkedProject.hours}h` : undefined,
    },
    {
      label: "Most used technology",
      value: summary.mostUsedTechnology?.name ?? "—",
      icon: Code2,
      caption: summary.mostUsedTechnology ? `${summary.mostUsedTechnology.hours}h` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="gap-2 py-4">
          <div className="flex items-center justify-between px-5">
            <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
            <item.icon className="size-4 text-muted-foreground/70" />
          </div>
          <div className="flex items-baseline gap-2 px-5">
            <span className="truncate text-xl font-semibold">{item.value}</span>
            {item.caption && <span className="text-xs text-muted-foreground">{item.caption}</span>}
          </div>
        </Card>
      ))}
    </div>
  );
}
