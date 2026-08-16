"use client";

import * as React from "react";
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getActivitySeriesAction } from "@/services/actions/analytics";
import type { ActivityRange } from "@/services/queries/analytics";

const RANGE_LABEL: Record<ActivityRange, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "3m": "3 Months",
  "1y": "1 Year",
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

export function WeeklyActivityChart() {
  const [range, setRange] = React.useState<ActivityRange>("7d");

  const { data, isLoading } = useQuery({
    queryKey: ["activity-series", range],
    queryFn: () => getActivitySeriesAction(range),
  });

  return (
    <Card className="py-4">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">Weekly Activity</CardTitle>
        <Tabs value={range} onValueChange={(v) => setRange(v as ActivityRange)}>
          <TabsList>
            {(Object.keys(RANGE_LABEL) as ActivityRange[]).map((r) => (
              <TabsTrigger key={r} value={r} className="text-xs">
                {RANGE_LABEL[r]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: "var(--color-chart-1)" }} />
                  Coding hours
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: "var(--color-chart-2)" }} />
                  Study hours
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="codingFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="studyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    minTickGap={24}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    width={28}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="codingHours"
                    name="Coding hours"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    fill="url(#codingFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="studyHours"
                    name="Study hours"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2}
                    fill="url(#studyFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Tasks completed</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    minTickGap={24}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    width={20}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="tasksCompleted" name="Tasks" fill="var(--color-chart-3)" radius={[3, 3, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
