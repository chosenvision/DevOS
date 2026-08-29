import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Briefcase, Building2, DollarSign, Users } from "lucide-react";

import { requireActiveOrg } from "@/services/auth";
import { getOrgMembers } from "@/services/queries/organizations";
import { getCrmOverview } from "@/services/queries/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/shared/motion";
import { TiltCard } from "@/components/shared/tilt-card";
import { CountUp } from "@/components/shared/count-up";
import { CRM_ACTIVITY_TYPE_LABEL, CRM_DEAL_STAGE_LABEL, CRM_DEAL_STAGE_ORDER } from "@/lib/constants";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Business — DevOS" };

export default async function BusinessOverviewPage() {
  const { supabase, organization, role } = await requireActiveOrg();
  const [members, crm] = await Promise.all([
    getOrgMembers(supabase, organization.id),
    getCrmOverview(supabase, organization.id),
  ]);

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingInvites = members.filter((m) => m.status === "invited");

  return (
    <div className="space-y-6">
      <Reveal>
        <Card className="flex-row items-center gap-4 py-4">
          <div className="flex flex-1 items-center gap-3 px-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">{organization.name}</p>
              <p className="text-xs text-muted-foreground">
                {activeMembers.length} {activeMembers.length === 1 ? "member" : "members"}
                {pendingInvites.length > 0 && ` · ${pendingInvites.length} pending invite${pendingInvites.length === 1 ? "" : "s"}`}
                {" · your role: "}
                {role}
              </p>
            </div>
          </div>
          <Button variant="outline" className="mr-5 shrink-0" asChild>
            <Link href="/business/team">
              <Users className="size-4" /> Manage team
            </Link>
          </Button>
        </Card>
      </Reveal>

      {activeMembers.length === 1 && pendingInvites.length === 0 && (
        <Reveal delay={0.06}>
          <Card className="flex-row items-center gap-4 border-primary/30 bg-primary/5 py-4">
            <div className="flex flex-1 items-center gap-3 px-5">
              <div>
                <p className="text-sm font-medium">Invite your team</p>
                <p className="text-xs text-muted-foreground">
                  Bring in teammates so clients, deals, and invoices are shared across your business, not just you.
                </p>
              </div>
            </div>
            <Button size="sm" className="mr-5 shrink-0" asChild>
              <Link href="/business/team">
                Invite <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </Card>
        </Reveal>
      )}

      <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StaggerItem>
          <TiltCard>
            <Card className="gap-3 py-4 transition-shadow hover:shadow-soft-lg">
              <div className="flex items-center justify-between px-5">
                <span className="text-xs font-medium text-muted-foreground">Open Pipeline</span>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="size-4" />
                </span>
              </div>
              <div className="px-5">
                <span className="text-2xl font-semibold tabular-nums">{formatCurrency(crm.openPipelineValue)}</span>
              </div>
            </Card>
          </TiltCard>
        </StaggerItem>
        <StaggerItem>
          <TiltCard>
            <Card className="gap-3 py-4 transition-shadow hover:shadow-soft-lg">
              <div className="flex items-center justify-between px-5">
                <span className="text-xs font-medium text-muted-foreground">Clients</span>
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Building2 className="size-4" />
                </span>
              </div>
              <div className="px-5">
                <span className="text-2xl font-semibold tabular-nums">
                  <CountUp value={crm.clientCount} />
                </span>
              </div>
            </Card>
          </TiltCard>
        </StaggerItem>
        <StaggerItem>
          <TiltCard>
            <Card className="gap-3 py-4 transition-shadow hover:shadow-soft-lg">
              <div className="flex items-center justify-between px-5">
                <span className="text-xs font-medium text-muted-foreground">Open Deals</span>
                <span className="flex size-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
                  <Briefcase className="size-4" />
                </span>
              </div>
              <div className="px-5">
                <span className="text-2xl font-semibold tabular-nums">
                  <CountUp
                    value={CRM_DEAL_STAGE_ORDER.filter((s) => s !== "won" && s !== "lost").reduce(
                      (sum, s) => sum + crm.dealsByStage[s],
                      0
                    )}
                  />
                </span>
              </div>
            </Card>
          </TiltCard>
        </StaggerItem>
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.1}>
          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-sm">Pipeline by stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CRM_DEAL_STAGE_ORDER.map((stage) => (
                <div key={stage} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{CRM_DEAL_STAGE_LABEL[stage]}</span>
                  <Badge variant="secondary">{crm.dealsByStage[stage]}</Badge>
                </div>
              ))}
              <Link href="/business/deals" className="mt-2 block text-xs text-primary hover:underline">
                View all deals →
              </Link>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.14}>
          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-sm">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {crm.recentActivities.length === 0 ? (
                <EmptyState title="No activity logged yet." description="Calls, emails, and meetings will show up here." />
              ) : (
                <ul className="space-y-2">
                  {crm.recentActivities.map((a) => (
                    <li key={a.id} className="text-sm">
                      <span className="text-muted-foreground">{CRM_ACTIVITY_TYPE_LABEL[a.type]}</span>
                      {a.client_name && <> with <span className="font-medium">{a.client_name}</span></>}
                      <span className="ml-1 text-xs text-muted-foreground">· {formatRelativeTime(a.occurred_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
