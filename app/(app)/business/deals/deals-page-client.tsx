"use client";

import * as React from "react";
import { Kanban, List, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DealsKanban } from "@/components/business/deals-kanban";
import { DealFormDialog } from "@/components/business/deal-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { runAction } from "@/lib/action-feedback";
import { deleteCrmDeal } from "@/services/actions/crm";
import { CRM_DEAL_STAGE_LABEL } from "@/lib/constants";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import type { CrmDealWithClient } from "@/services/queries/crm";
import type { CrmClient } from "@/types/database";

type ViewMode = "kanban" | "table";

export function DealsPageClient({
  organizationId,
  deals,
  clients,
}: {
  organizationId: string;
  deals: CrmDealWithClient[];
  clients: CrmClient[];
}) {
  const [view, setView] = React.useState<ViewMode>("kanban");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="kanban">
              <Kanban className="size-3.5" /> Kanban
            </TabsTrigger>
            <TabsTrigger value="table">
              <List className="size-3.5" /> Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button className="ml-auto" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> New deal
        </Button>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          title="No deals yet."
          description="Track opportunities from first contact through won or lost."
          actionLabel="Add deal"
          onAction={() => setDialogOpen(true)}
        />
      ) : view === "kanban" ? (
        <DealsKanban organizationId={organizationId} deals={deals} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Expected close</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">{deal.title}</TableCell>
                <TableCell className="text-muted-foreground">{deal.client_name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={deal.stage === "won" ? "success" : deal.stage === "lost" ? "destructive" : "outline"}>
                    {CRM_DEAL_STAGE_LABEL[deal.stage]}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(deal.value, deal.currency)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.expected_close_date ? formatShortDate(deal.expected_close_date) : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive"
                    aria-label={`Delete ${deal.title}`}
                    onClick={() => runAction(() => deleteCrmDeal(organizationId, deal.id))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <DealFormDialog organizationId={organizationId} clients={clients} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
