import { Card } from "@/components/ui/card";
import type { ApplicationAnalytics } from "@/services/queries/career";

export function ApplicationsAnalytics({ analytics }: { analytics: ApplicationAnalytics }) {
  const items = [
    { label: "Submitted", value: String(analytics.submitted) },
    { label: "Response rate", value: `${analytics.responseRate}%` },
    { label: "Interview rate", value: `${analytics.interviewRate}%` },
    { label: "Offer rate", value: `${analytics.offerRate}%` },
    { label: "Avg. response time", value: analytics.avgResponseDays !== null ? `${analytics.avgResponseDays}d` : "—" },
    { label: "Best source", value: analytics.bestSource ?? "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label} className="gap-1 py-3">
          <p className="px-4 text-xs text-muted-foreground">{item.label}</p>
          <p className="truncate px-4 text-lg font-semibold">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
