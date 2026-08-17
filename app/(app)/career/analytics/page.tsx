import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getApplicationAnalytics, getApplicationFunnel, getSourceAnalytics } from "@/services/queries/career";
import { ApplicationsAnalytics } from "@/components/career/applications-analytics";
import { ApplicationFunnelChart } from "@/components/career/application-funnel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Career Analytics — DevOS" };

export default async function CareerAnalyticsPage() {
  const { supabase, user } = await requireUser();
  const [analytics, funnel, sources] = await Promise.all([
    getApplicationAnalytics(supabase, user.id),
    getApplicationFunnel(supabase, user.id),
    getSourceAnalytics(supabase, user.id),
  ]);

  return (
    <div className="space-y-6">
      <ApplicationsAnalytics analytics={analytics} />
      <ApplicationFunnelChart stages={funnel} />

      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Source Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a &ldquo;source&rdquo; (LinkedIn, referral, company site...) to your applications to see which channels work best.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 font-medium">Source</th>
                    <th className="py-2 font-medium">Applications</th>
                    <th className="py-2 font-medium">Interviews</th>
                    <th className="py-2 font-medium">Offers</th>
                    <th className="py-2 font-medium">Interview Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr key={s.source} className="border-b border-border/60 last:border-0">
                      <td className="py-2 font-medium">{s.source}</td>
                      <td className="py-2 tabular-nums">{s.total}</td>
                      <td className="py-2 tabular-nums">{s.interviews}</td>
                      <td className="py-2 tabular-nums">{s.offers}</td>
                      <td className="py-2 tabular-nums">{s.interviewRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
