"use client";

import { toast } from "sonner";

import { KanbanBoard, type KanbanColumn } from "@/components/shared/kanban-board";
import { Card } from "@/components/ui/card";
import { updateApplicationStatus } from "@/services/actions/career";
import { APPLICATION_STATUS_LABEL, APPLICATION_STATUS_ORDER } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { JobApplication } from "@/types/database";

const COLUMNS: KanbanColumn[] = APPLICATION_STATUS_ORDER.map((status) => ({
  id: status,
  label: APPLICATION_STATUS_LABEL[status],
}));

export function ApplicationsKanban({ applications }: { applications: JobApplication[] }) {
  return (
    <KanbanBoard
      columns={COLUMNS}
      items={applications}
      getId={(a) => a.id}
      getColumnId={(a) => a.status}
      onMove={async (id, status) => {
        const res = await updateApplicationStatus(id, status);
        if (res.error) toast.error(res.error);
      }}
      renderCard={(app) => (
        <Card className="gap-1 py-3 shadow-none">
          <p className="truncate px-3 text-sm font-medium">{app.position}</p>
          <p className="truncate px-3 text-xs text-muted-foreground">{app.company_name}</p>
          {app.date_applied && (
            <p className="px-3 text-[11px] text-muted-foreground">Applied {formatShortDate(app.date_applied)}</p>
          )}
        </Card>
      )}
    />
  );
}
