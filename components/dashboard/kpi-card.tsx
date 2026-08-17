import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { percentChange } from "@/lib/analytics";
import { TONE_CLASSES, type Tone as KpiTone } from "@/lib/constants";
import { CountUp } from "@/components/shared/count-up";
import { TiltCard } from "@/components/shared/tilt-card";

interface KpiCardProps {
  label: string;
  value: string;
  numeric?: number;
  decimals?: number;
  icon: LucideIcon;
  previous?: number;
  current?: number;
  suffix?: string;
  caption?: string;
  invertTrend?: boolean;
  tone?: KpiTone;
}

export function KpiIconChip({ icon: Icon, tone = "primary" }: { icon: LucideIcon; tone?: KpiTone }) {
  return (
    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", TONE_CLASSES[tone])}>
      <Icon className="size-4" />
    </span>
  );
}

export function KpiCard({
  label,
  value,
  numeric,
  decimals = 0,
  suffix = "",
  icon,
  previous,
  current,
  caption,
  invertTrend,
  tone = "primary",
}: KpiCardProps) {
  const change =
    previous !== undefined && current !== undefined ? percentChange(current, previous) : null;
  const isFlat = change === null || change === 0;
  const isUp = !isFlat && change! > 0;
  const positive = invertTrend ? !isUp : isUp;

  return (
    <TiltCard>
      <Card className="gap-3 py-4 transition-shadow hover:shadow-soft-lg">
        <div className="flex items-center justify-between px-5">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <KpiIconChip icon={icon} tone={tone} />
        </div>
        <div className="flex items-baseline gap-2 px-5">
          <span className="text-2xl font-semibold tabular-nums">
            {numeric !== undefined ? <CountUp value={numeric} decimals={decimals} suffix={suffix} /> : value}
          </span>
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
    </TiltCard>
  );
}
