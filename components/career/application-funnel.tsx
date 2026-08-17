import { Card } from "@/components/ui/card";
import type { ApplicationFunnel } from "@/services/queries/career";

export function ApplicationFunnelChart({ stages }: { stages: ApplicationFunnel[] }) {
  const max = Math.max(1, ...stages.map((s) => s.count));

  return (
    <Card className="gap-3 py-4">
      <div className="flex items-center justify-between px-5">
        <p className="text-sm font-medium">Application Funnel</p>
        <p className="text-xs text-muted-foreground">Saved → Applied → Assessment → Interview → Final → Offer</p>
      </div>
      <div className="space-y-2.5 px-5">
        {stages.map((stage, i) => {
          const prev = i > 0 ? stages[i - 1].count : null;
          const conversion = prev && prev > 0 ? Math.round((stage.count / prev) * 100) : null;
          return (
            <div key={stage.stage} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs text-muted-foreground">{stage.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(4, (stage.count / max) * 100)}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">{stage.count}</span>
              <span className="w-10 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
                {conversion !== null ? `${conversion}%` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
