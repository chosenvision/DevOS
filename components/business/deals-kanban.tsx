"use client";

import { toast } from "sonner";

import { KanbanBoard, type KanbanColumn } from "@/components/shared/kanban-board";
import { Card } from "@/components/ui/card";
import { updateCrmDealStage } from "@/services/actions/crm";
import { CRM_DEAL_STAGE_LABEL, CRM_DEAL_STAGE_ORDER } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { CrmDealWithClient } from "@/services/queries/crm";

const COLUMNS: KanbanColumn[] = CRM_DEAL_STAGE_ORDER.map((stage) => ({
  id: stage,
  label: CRM_DEAL_STAGE_LABEL[stage],
  accentClassName: stage === "won" ? "bg-success" : stage === "lost" ? "bg-destructive" : undefined,
}));

export function DealsKanban({ organizationId, deals }: { organizationId: string; deals: CrmDealWithClient[] }) {
  return (
    <KanbanBoard
      columns={COLUMNS}
      items={deals}
      getId={(d) => d.id}
      getColumnId={(d) => d.stage}
      onMove={async (id, stage) => {
        const res = await updateCrmDealStage(organizationId, id, stage);
        if (res.error) toast.error(res.error);
      }}
      renderCard={(deal) => (
        <Card className="gap-1 py-3 shadow-none">
          <p className="truncate px-3 text-sm font-medium">{deal.title}</p>
          {deal.client_name && <p className="truncate px-3 text-xs text-muted-foreground">{deal.client_name}</p>}
          <p className="px-3 text-[11px] font-medium text-muted-foreground">{formatCurrency(deal.value, deal.currency)}</p>
        </Card>
      )}
    />
  );
}
