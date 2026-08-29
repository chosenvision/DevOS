"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Users, Handshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientFormDialog } from "@/components/business/client-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Stagger, StaggerItem } from "@/components/shared/motion";
import { CRM_CLIENT_STATUS_BADGE, CRM_CLIENT_STATUS_LABEL } from "@/lib/constants";
import type { CrmClientWithCounts } from "@/services/queries/crm";

export function ClientsPageClient({
  organizationId,
  clients,
}: {
  organizationId: string;
  clients: CrmClientWithCounts[];
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{clients.length} clients</p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> New client
        </Button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet."
          description="Add the businesses you work with to track deals, contacts, and activity."
          actionLabel="Add client"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <StaggerItem key={client.id}>
              <Link href={`/business/clients/${client.id}`}>
                <Card className="hover-lift h-full gap-3 py-4 hover:border-primary/40 hover:bg-accent/30 hover:shadow-soft-lg">
                  <div className="flex items-start justify-between gap-2 px-5">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{client.name}</p>
                      {client.industry && <p className="text-xs text-muted-foreground">{client.industry}</p>}
                    </div>
                    <Badge variant={CRM_CLIENT_STATUS_BADGE[client.status]}>{CRM_CLIENT_STATUS_LABEL[client.status]}</Badge>
                  </div>
                  <div className="flex items-center gap-4 px-5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" /> {client.contact_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Handshake className="size-3.5" /> {client.open_deal_count} open
                    </span>
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <ClientFormDialog organizationId={organizationId} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
