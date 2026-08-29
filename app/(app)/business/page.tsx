import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2, Users } from "lucide-react";

import { requireActiveOrg } from "@/services/auth";
import { getOrgMembers } from "@/services/queries/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/motion";

export const metadata: Metadata = { title: "Business — DevOS" };

export default async function BusinessOverviewPage() {
  const { supabase, organization, role } = await requireActiveOrg();
  const members = await getOrgMembers(supabase, organization.id);

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
        <Reveal delay={0.08}>
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

      <Reveal delay={0.14}>
        <Card className="py-4">
          <CardHeader>
            <CardTitle className="text-sm">What&apos;s next</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Clients, deals, invoicing, and expenses are landing here in the next phases of the Business module.
              Your organization and team are set up and ready for them.
            </p>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
