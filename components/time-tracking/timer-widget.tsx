"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Square } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { startTimer, stopTimer } from "@/services/actions/time-entries";

function formatClock(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function TimerWidget({ projects }: { projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const [running, setRunning] = React.useState<{ id: string; started_at: string } | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [projectId, setProjectId] = React.useState<string>("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from("time_entries")
      .select("id, started_at")
      .eq("is_running", true)
      .maybeSingle()
      .then(({ data }) => data && setRunning(data));
  }, []);

  React.useEffect(() => {
    if (!running) return;
    const start = new Date(running.started_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running]);

  async function handleStart() {
    await startTimer({ projectId: projectId || undefined, description: description || undefined, category: "project" });
    const supabase = createClient();
    const { data } = await supabase
      .from("time_entries")
      .select("id, started_at")
      .eq("is_running", true)
      .maybeSingle();
    if (data) setRunning(data);
    toast.success("Timer started.");
  }

  async function handleStop() {
    if (!running) return;
    const res = await stopTimer(running.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      setRunning(null);
      setElapsed(0);
      toast.success("Timer stopped.");
      router.refresh();
    }
  }

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center font-mono text-4xl font-semibold tabular-nums">{formatClock(elapsed)}</p>
        {!running && (
          <div className="space-y-2">
            {projects.length > 0 && (
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="No project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
            />
          </div>
        )}
        <div className="flex justify-center">
          {running ? (
            <Button size="lg" variant="outline" onClick={handleStop}>
              <Square className="size-4 fill-current" /> Stop
            </Button>
          ) : (
            <Button size="lg" onClick={handleStart}>
              <Play className="size-4" /> Start timer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
