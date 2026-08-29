"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { formatCurrency } from "@/lib/utils";
import type { MonthlyIncomeExpense } from "@/services/queries/reports";

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-medium text-foreground">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function IncomeExpenseChart({ data }: { data: MonthlyIncomeExpense[] }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: "var(--color-chart-3)" }} />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: "var(--color-chart-2)" }} />
          Expense
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} width={40} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="income" name="Income" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
