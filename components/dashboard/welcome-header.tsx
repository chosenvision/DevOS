"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { getGreeting, getMotivationalMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/ui-store";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { FloatingOrbs } from "@/components/shared/floating-orbs";
import { Plus } from "lucide-react";

export function WelcomeHeader({ name }: { name: string }) {
  const [now, setNow] = React.useState(() => new Date());
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border/80 bg-glow bg-card px-5 py-5 shadow-soft sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6">
      <FloatingOrbs />
      <div className="relative">
        <motion.h1
          initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl font-semibold tracking-tight text-balance sm:text-[1.75rem]"
        >
          {getGreeting()}, {name}{" "}
          <motion.span
            aria-hidden
            className="inline-block"
            animate={reducedMotion ? undefined : { rotate: [0, 14, -8, 14, 0] }}
            transition={{ duration: 1.4, delay: 0.5, ease: "easeInOut" }}
          >
            👋
          </motion.span>
        </motion.h1>
        <motion.p
          initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-1 text-sm text-muted-foreground"
        >
          {getMotivationalMessage()}
        </motion.p>
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
