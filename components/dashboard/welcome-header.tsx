"use client";

import * as React from "react";

import { getGreeting, getMotivationalMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/ui-store";
import { FloatingOrbs } from "@/components/shared/floating-orbs";
import { Plus } from "lucide-react";

export function WelcomeHeader({ name }: { name: string }) {
  const [now, setNow] = React.useState(() => new Date());
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border/80 bg-glow bg-card px-5 py-5 shadow-soft sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6">
      <FloatingOrbs />
      <div className="relative">
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-[1.75rem]">
          {getGreeting()}, {name} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{getMotivationalMessage()}</p>
        <p className="mt-1 text-xs text-muted-foreground/70 tabular-nums" suppressHydrationWarning>
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          {" · "}
          {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
      </div>
      <Button onClick={() => openQuickAdd()} className="w-full sm:w-auto">
        <Plus className="size-4" />
        Quick add
      </Button>
    </div>
  );
}
