import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime, formatDuration } from "@/lib/utils";
import type { TimeEntry } from "@/types/database";

const CATEGORY_LABEL: Record<string, string> = {
  project: "Project",
  learning: "Learning",
  interview_prep: "Interview prep",
  other: "Other",
};

export function RecentEntries({ entries }: { entries: TimeEntry[] }) {
  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">Recent sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState title="No time logged yet." description="Start a timer or log time manually to see it here." />
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate">
                    {entry.project?.name ?? entry.description ?? "Untitled session"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(entry.started_at)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="secondary">{CATEGORY_LABEL[entry.category]}</Badge>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {entry.duration_minutes ? formatDuration(entry.duration_minutes) : "running"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
