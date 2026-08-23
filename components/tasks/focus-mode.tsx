"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, Pause, Play, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { startTimer, stopTimer } from "@/services/actions/time-entries";
import { updateTask, updateTaskStatus, addSubtask, toggleSubtask } from "@/services/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskSubtask } from "@/types/database";

function formatClock(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function FocusMode({ task, subtasks: initialSubtasks }: { task: Task; subtasks: TaskSubtask[] }) {
  const router = useRouter();
  const [subtasks, setSubtasks] = React.useState(initialSubtasks);
  const [newSubtask, setNewSubtask] = React.useState("");
  const [notes, setNotes] = React.useState(task.description ?? "");
  const lastSavedNotes = React.useRef(task.description ?? "");
  const [runningEntryId, setRunningEntryId] = React.useState<string | null>(null);
  const [startedAt, setStartedAt] = React.useState<string | null>(null);
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from("time_entries")
      .select("id, started_at")
      .eq("task_id", task.id)
      .eq("is_running", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setRunningEntryId(data.id);
          setStartedAt(data.started_at);
        }
      });
  }, [task.id]);

  React.useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  React.useEffect(() => {
    const id = setTimeout(() => {
      if (notes !== lastSavedNotes.current) {
        lastSavedNotes.current = notes;
        const fd = new FormData();
        fd.set("title", task.title);
        fd.set("description", notes);
        fd.set("status", task.status);
        fd.set("priority", task.priority);
        fd.set("projectId", task.project_id ?? "");
        updateTask(task.id, fd).then((res) => {
          if (res.error) toast.error(res.error);
        });
      }
    }, 1200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  async function handleStart() {
    await startTimer({ taskId: task.id, projectId: task.project_id ?? undefined, category: "project" });
    const supabase = createClient();
    const { data } = await supabase
      .from("time_entries")
      .select("id, started_at")
      .eq("task_id", task.id)
      .eq("is_running", true)
      .maybeSingle();
    if (data) {
      setRunningEntryId(data.id);
      setStartedAt(data.started_at);
    }
  }

  async function handlePause() {
    if (!runningEntryId) return;
    await stopTimer(runningEntryId);
    setRunningEntryId(null);
    setStartedAt(null);
  }

  async function handleComplete() {
    if (runningEntryId) await stopTimer(runningEntryId);
    const res = await updateTaskStatus(task.id, "completed");
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Task completed. Nice work.");
      router.push("/tasks");
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-8 p-6">
      <Link href="/tasks" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Exit focus mode
      </Link>

      <div className="space-y-2 text-center">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Focus session</p>
        <h1 className="text-2xl font-semibold">{task.title}</h1>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="font-mono text-6xl font-semibold tabular-nums tracking-tight">{formatClock(elapsed)}</p>
        <div className="flex gap-2">
          {runningEntryId ? (
            <Button size="lg" variant="outline" onClick={handlePause}>
              <Pause className="size-4" /> Pause
            </Button>
          ) : (
            <Button size="lg" onClick={handleStart}>
              <Play className="size-4" /> Start
            </Button>
          )}
          <Button size="lg" variant="outline" onClick={handleComplete}>
            <Check className="size-4" /> Complete task
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Subtasks</p>
        {subtasks.length > 0 && (
          <ul className="space-y-1.5">
            {subtasks.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <Checkbox
                  checked={s.is_completed}
                  onCheckedChange={(checked) => {
                    setSubtasks((prev) => prev.map((x) => (x.id === s.id ? { ...x, is_completed: !!checked } : x)));
                    toggleSubtask(s.id, !!checked).then((res) => {
                      if (res.error) {
                        setSubtasks((prev) => prev.map((x) => (x.id === s.id ? { ...x, is_completed: !checked } : x)));
                        toast.error(res.error);
                      }
                    });
                  }}
                />
                <span className={s.is_completed ? "text-sm text-muted-foreground line-through" : "text-sm"}>
                  {s.title}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Add a subtask"
            onKeyDown={async (e) => {
              if (e.key === "Enter" && newSubtask.trim()) {
                e.preventDefault();
                await addSubtask(task.id, newSubtask.trim());
                setSubtasks((prev) => [
                  ...prev,
                  { id: crypto.randomUUID(), task_id: task.id, user_id: "", title: newSubtask.trim(), is_completed: false, sort_order: prev.length, created_at: new Date().toISOString() },
                ]);
                setNewSubtask("");
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={async () => {
              if (!newSubtask.trim()) return;
              await addSubtask(task.id, newSubtask.trim());
              setSubtasks((prev) => [
                ...prev,
                { id: crypto.randomUUID(), task_id: task.id, user_id: "", title: newSubtask.trim(), is_completed: false, sort_order: prev.length, created_at: new Date().toISOString() },
              ]);
              setNewSubtask("");
            }}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Notes</p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Jot down anything useful while you work..."
        />
      </div>
    </div>
  );
}
