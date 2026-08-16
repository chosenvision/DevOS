"use client";

import * as React from "react";

import { getGreeting, getMotivationalMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/ui-store";
import { Plus } from "lucide-react";

export function WelcomeHeader({ name }: { name: string }) {
  const [now, setNow] = React.useState(() => new Date());
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, {name} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{getMotivationalMessage()}</p>
        <p className="mt-1 text-xs text-muted-foreground/70 tabular-nums" suppressHydrationWarning>
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          {" · "}
          {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
      </div>
      <Button onClick={() => openQuickAdd()}>
        <Plus className="size-4" />
        Quick add
      </Button>
    </div>
  );
}
