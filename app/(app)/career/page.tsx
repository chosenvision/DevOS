import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, UserCog } from "lucide-react";

import { requireUser } from "@/services/auth";
import { getCareerCommandCenterData, getApplicationFunnel, getCareerProfile } from "@/services/queries/career";
import { CareerKpiRow } from "@/components/career/career-kpi-row";
import { PriorityList } from "@/components/career/priority-list";
import { ApplicationFunnelChart } from "@/components/career/application-funnel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Career Overview — DevOS" };

export default async function CareerOverviewPage() {
  const { supabase, user } = await requireUser();

  const [data, funnel, profile] = await Promise.all([
    getCareerCommandCenterData(supabase, user.id),
    getApplicationFunnel(supabase, user.id),
    getCareerProfile(supabase, user.id),
  ]);

  const profileIncomplete = !profile || profile.skills.length === 0;

  return (
    <div className="space-y-6">
      {profileIncomplete && (
        <Card className="flex-row items-center gap-4 border-primary/30 bg-primary/5 py-4">
          <div className="flex flex-1 items-center gap-3 px-5">
            <UserCog className="size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">Set up your Career Profile</p>
              <p className="text-xs text-muted-foreground">
                Add your skills, preferences, and salary target so job matches and priorities here are accurate.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="mr-5 shrink-0" asChild>
            <Link href="/career/profile">
              Complete profile <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </Card>
      )}

      <CareerKpiRow data={data} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Today&apos;s Career Priorities</h2>
        <PriorityList priorities={data.priorities} />
      </div>

      <ApplicationFunnelChart stages={funnel} />
    </div>
  );
}
