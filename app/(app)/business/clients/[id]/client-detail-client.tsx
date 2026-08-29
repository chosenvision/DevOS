"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, Globe, Phone, Trash2, UserPlus, MessageSquarePlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ContactFormDialog } from "@/components/business/contact-form-dialog";
import { ActivityFormDialog } from "@/components/business/activity-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { runAction } from "@/lib/action-feedback";
import { deleteCrmClient, deleteCrmContact, deleteCrmActivity } from "@/services/actions/crm";
import { CRM_ACTIVITY_TYPE_LABEL, CRM_CLIENT_STATUS_BADGE, CRM_CLIENT_STATUS_LABEL, CRM_DEAL_STAGE_LABEL } from "@/lib/constants";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { CrmClientDetail } from "@/services/queries/crm";

export function ClientDetailClient({
  organizationId,
  detail,
}: {
  organizationId: string;
  detail: CrmClientDetail;
}) {
  const router = useRouter();
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = React.useState(false);
  const { client, contacts, deals, activities } = detail;

  return (
    <div className="space-y-6">
      <Card className="py-4">
        <div className="flex items-start justify-between gap-3 px-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{client.name}</h1>
              <Badge variant={CRM_CLIENT_STATUS_BADGE[client.status]}>{CRM_CLIENT_STATUS_LABEL[client.status]}</Badge>
            </div>
            {client.industry && <p className="text-sm text-muted-foreground">{client.industry}</p>}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="text-destructive" aria-label="Delete client">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {client.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the client along with its contacts, deals, and activity log. This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    const res = await deleteCrmClient(organizationId, client.id);
                    if (res.error) return;
                    router.push("/business/clients");
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {client.website && (
          <div className="px-5">
            <a
              href={client.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Globe className="size-3.5" /> {client.website}
            </a>
          </div>
        )}
        {client.notes && <p className="px-5 text-sm text-muted-foreground">{client.notes}</p>}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="py-4">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Contacts</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setContactDialogOpen(true)}>
              <UserPlus className="size-3.5" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <EmptyState title="No contacts yet." description="Add the people you work with at this client." />
            ) : (
              <ul className="divide-y divide-border">
                {contacts.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        {c.role && <span>{c.role}</span>}
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" /> {c.email}
                          </span>
                        )}
                        {c.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" /> {c.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 text-destructive"
                      aria-label={`Remove ${c.name}`}
                      onClick={() => runAction(() => deleteCrmContact(organizationId, c.id))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader>
            <CardTitle className="text-sm">Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <EmptyState title="No deals yet." description="Deals with this client will show up here." />
            ) : (
              <ul className="divide-y divide-border">
                {deals.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <span className="truncate font-medium">{d.title}</span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {formatCurrency(d.value, d.currency)}
                      <Badge variant={d.stage === "won" ? "success" : d.stage === "lost" ? "destructive" : "outline"}>
                        {CRM_DEAL_STAGE_LABEL[d.stage]}
                      </Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="py-4">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Activity</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setActivityDialogOpen(true)}>
            <MessageSquarePlus className="size-3.5" /> Log activity
          </Button>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <EmptyState title="No activity logged yet." description="Calls, emails, meetings, and notes will show up here." />
          ) : (
            <ul className="space-y-3">
              {activities.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{CRM_ACTIVITY_TYPE_LABEL[a.type]}</Badge>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(a.occurred_at)}</span>
                    </div>
                    <p className="mt-1 text-sm">{a.description}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 shrink-0 text-destructive"
                    aria-label="Delete activity"
                    onClick={() => runAction(() => deleteCrmActivity(organizationId, a.id))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ContactFormDialog
        organizationId={organizationId}
        clientId={client.id}
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
      />
      <ActivityFormDialog
        organizationId={organizationId}
        clientId={client.id}
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
      />
    </div>
  );
}
