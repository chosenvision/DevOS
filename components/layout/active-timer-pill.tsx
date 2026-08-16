"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Square, Timer } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { stopTimer } from "@/services/actions/time-entries";
import { Button } from "@/components/ui/button";
import type { TimeEntry } from "@/types/database";

function useElapsed(startedAt: string | undefined) {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return elapsed;
}

function formatClock(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function ActiveTimerPill() {
  const queryClient = useQueryClient();

  const { data: running } = useQuery({
    queryKey: ["running-timer"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("time_entries")
        .select("*, project:projects(id, name)")
        .eq("is_running", true)
        .maybeSingle();
      return (data ?? null) as TimeEntry | null;
    },
    refetchInterval: 30_000,
  });

  const elapsed = useElapsed(running?.started_at);

  if (!running) return null;

  async function handleStop() {
    if (!running) return;
    const res = await stopTimer(running.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Timer stopped.");
      queryClient.invalidateQueries({ queryKey: ["running-timer"] });
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs">
      <Timer className="size-3.5 text-primary" />
      <span className="hidden font-medium text-foreground sm:inline">
        {running.project?.name ?? running.description ?? "Coding session"}
      </span>
      <span className="font-mono tabular-nums text-primary">{formatClock(elapsed)}</span>
      <Button size="icon" variant="ghost" className="size-5" onClick={handleStop} aria-label="Stop timer">
        <Square className="size-3 fill-current" />
      </Button>
    </div>
  );
}
