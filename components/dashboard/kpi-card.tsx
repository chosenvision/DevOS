import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { percentChange } from "@/lib/analytics";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  previous?: number;
  current?: number;
  suffix?: string;
  caption?: string;
  invertTrend?: boolean;
}

export function KpiCard({ label, value, icon: Icon, previous, current, caption, invertTrend }: KpiCardProps) {
  const change =
    previous !== undefined && current !== undefined ? percentChange(current, previous) : null;
  const isFlat = change === null || change === 0;
  const isUp = !isFlat && change! > 0;
  const positive = invertTrend ? !isUp : isUp;

  return (
    <Card className="gap-2 py-4">
      <div className="flex items-center justify-between px-5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground/70" />
      </div>
      <div className="flex items-baseline gap-2 px-5">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {caption && <span className="text-xs text-muted-foreground">{caption}</span>}
      </div>
      {change !== null && !isFlat && (
        <div className="px-5">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              positive ? "text-[oklch(0.5_0.14_155)] dark:text-success" : "text-destructive"
            )}
          >
            {isUp ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {Math.abs(change!)}%
            <span className="font-normal text-muted-foreground">vs last week</span>
          </span>
        </div>
      )}
      {(isFlat || change === null) && !caption && (
        <div className="px-5">
          <span className="inline-flex items-center gap-0.5 text-xs font-normal text-muted-foreground">
            <Minus className="size-3" />
            No change
          </span>
        </div>
      )}
    </Card>
  );
}
