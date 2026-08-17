import Link from "next/link";
import { ArrowRight, Circle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CareerPriority } from "@/services/queries/career";

const URGENCY_LABEL: Record<CareerPriority["urgency"], string> = {
  overdue: "Overdue",
  today: "Today",
  soon: "This week",
};

const URGENCY_VARIANT: Record<CareerPriority["urgency"], "destructive" | "warning" | "secondary"> = {
  overdue: "destructive",
  today: "warning",
  soon: "secondary",
};

export function PriorityList({ priorities }: { priorities: CareerPriority[] }) {
  if (priorities.length === 0) {
    return (
      <Card className="items-center py-10 text-center">
        <div className="flex flex-col items-center gap-2 px-5">
          <Circle className="size-6 text-muted-foreground/50" />
          <p className="text-sm font-medium">Nothing urgent right now.</p>
          <p className="text-xs text-muted-foreground">
            Follow-ups, upcoming interviews, and high-match jobs will show up here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="gap-0 divide-y divide-border py-0">
      {priorities.map((p) => (
        <Link
          key={p.id}
          href={p.href}
          className="group flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-accent/50 first:rounded-t-xl last:rounded-b-xl"
        >
          <Badge variant={URGENCY_VARIANT[p.urgency]} className={cn(p.urgency === "soon" && "text-muted-foreground")}>
            {URGENCY_LABEL[p.urgency]}
          </Badge>
          <span className="flex-1 truncate">{p.label}</span>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </Card>
  );
}
