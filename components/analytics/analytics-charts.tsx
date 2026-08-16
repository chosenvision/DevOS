"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GitCommitHorizontal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getActivitySeriesAction, getAnalyticsOverviewAction } from "@/services/actions/analytics";
import type { ActivityRange } from "@/services/queries/analytics";

const RANGE_LABEL: Record<ActivityRange, string> = {
  "7d": "Weekly",
  "30d": "Monthly",
  "3m": "Quarterly",
  "1y": "Yearly",
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function AnalyticsCharts({ githubConnected }: { githubConnected: boolean }) {
  const [range, setRange] = React.useState<ActivityRange>("30d");

  const { data: series, isLoading: seriesLoading } = useQuery({
    queryKey: ["activity-series", range],
    queryFn: () => getActivitySeriesAction(range),
  });

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["analytics-overview", range],
    queryFn: () => getAnalyticsOverviewAction(range),
  });

  const isLoading = seriesLoading || overviewLoading;

  return (
    <div className="space-y-4">
      <Tabs value={range} onValueChange={(v) => setRange(v as ActivityRange)}>
        <TabsList>
          {(Object.keys(RANGE_LABEL) as ActivityRange[]).map((r) => (
            <TabsTrigger key={r} value={r}>{RANGE_LABEL[r]}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading || !series || !overview ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-sm">Coding & Learning Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ backgroundColor: "var(--color-chart-1)" }} />Coding ({overview.totalCodingHours}h total)</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ backgroundColor: "var(--color-chart-2)" }} />Learning ({overview.totalLearningHours}h total)</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={series} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="a-coding" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="a-study" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} minTickGap={30} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} width={28} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="codingHours" name="Coding" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#a-coding)" />
                  <Area type="monotone" dataKey="studyHours" name="Learning" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#a-study)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-sm">Coding Problems Solved</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={overview.problemsSolvedSeries} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} minTickGap={30} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} width={24} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Solved" fill="var(--color-chart-3)" radius={[3, 3, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-sm">Technologies Used</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.technologiesUsed.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Log time against projects to see this.</p>
              ) : (
                <div className="space-y-2.5">
                  {overview.technologiesUsed.map((t) => {
                    const max = overview.technologiesUsed[0].hours || 1;
                    return (
                      <div key={t.name} className="flex items-center gap-3 text-sm">
                        <span className="w-24 shrink-0 truncate">{t.name}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-[var(--color-chart-1)]" style={{ width: `${(t.hours / max) * 100}%` }} />
                        </div>
                        <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">{t.hours}h</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-sm">Completion Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">Projects completed</span>
                  <span className="font-medium">
                    {overview.projectCompletion.completed} / {overview.projectCompletion.total}
                  </span>
                </div>
                <Progress value={overview.projectCompletion.total ? (overview.projectCompletion.completed / overview.projectCompletion.total) * 100 : 0} />
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">Tasks completed (this range)</span>
                  <span className="font-medium">
                    {overview.taskCompletion.completed} / {overview.taskCompletion.total}
                  </span>
                </div>
                <Progress value={overview.taskCompletion.total ? (overview.taskCompletion.completed / overview.taskCompletion.total) * 100 : 0} />
              </div>
              <div className="flex items-center gap-2 rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                <GitCommitHorizontal className="size-4" />
                {githubConnected ? (
                  <span>GitHub activity syncing.</span>
                ) : (
                  <span>
                    <Link href="/settings/integrations" className="text-primary hover:underline">Connect GitHub</Link> to see commit activity here.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
