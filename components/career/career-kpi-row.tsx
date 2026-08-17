import { Briefcase, CalendarClock, ClipboardCheck, Sparkles, Trophy, Bell } from "lucide-react";

import { Card } from "@/components/ui/card";
import { KpiIconChip } from "@/components/dashboard/kpi-card";
import type { CareerCommandCenterData } from "@/services/queries/career";

export function CareerKpiRow({ data }: { data: CareerCommandCenterData }) {
  const items = [
    { label: "Active Applications", value: data.activeApplications, icon: Briefcase, tone: "primary" as const },
    { label: "Applied This Week", value: data.applicationsThisWeek, icon: ClipboardCheck, tone: "success" as const },
    { label: "Interviews Scheduled", value: data.interviewsScheduled, icon: CalendarClock, tone: "warning" as const },
    { label: "High-Match Jobs", value: data.highMatchJobs, icon: Sparkles, tone: "accent" as const },
    { label: "Follow-ups Due", value: data.followUpsDue, icon: Bell, tone: "destructive" as const },
    { label: "Offers", value: data.offers, icon: Trophy, tone: "success" as const },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label} className="gap-2 py-3">
          <div className="flex items-center justify-between px-4">
            <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
          </div>
          <div className="flex items-center gap-2 px-4">
            <KpiIconChip icon={item.icon} tone={item.tone} />
            <span className="text-xl font-semibold tabular-nums">{item.value}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
