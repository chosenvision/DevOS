import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import type { ActivityLogEntry } from "@/types/database";

export function ActivityTab({ activity }: { activity: ActivityLogEntry[] }) {
  if (activity.length === 0) {
    return <EmptyState title="No activity yet." description="Actions on this project will show up here automatically." />;
  }

  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {activity.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[27px] top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
          <p className="text-sm">{entry.message}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(entry.occurred_at)}</p>
        </li>
      ))}
    </ol>
  );
}
