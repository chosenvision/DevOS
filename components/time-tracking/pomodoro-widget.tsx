"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pause, Play, RotateCcw, Settings2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createManualTimeEntry } from "@/services/actions/time-entries";
import { updatePomodoroSettings } from "@/services/actions/preferences";
import type { UserPreferences } from "@/types/database";

type Phase = "focus" | "short_break" | "long_break";

const PHASE_LABEL: Record<Phase, string> = {
  focus: "Focus",
  short_break: "Short break",
  long_break: "Long break",
};

export function PomodoroWidget({ preferences }: { preferences: UserPreferences }) {
  const [settings, setSettings] = React.useState({
    focus: preferences.pomodoro_focus_minutes,
    short: preferences.pomodoro_short_break_minutes,
    long: preferences.pomodoro_long_break_minutes,
    sessionsBeforeLong: preferences.pomodoro_sessions_before_long_break,
  });
  const [phase, setPhase] = React.useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = React.useState(settings.focus * 60);
  const [running, setRunning] = React.useState(false);
  const [completedSessions, setCompletedSessions] = React.useState(0);

  const phaseMinutes = phase === "focus" ? settings.focus : phase === "short_break" ? settings.short : settings.long;

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          handlePhaseComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);

  function handlePhaseComplete() {
    setRunning(false);
    if (phase === "focus") {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);
      toast.success("Focus session complete. Take a break.");

      const fd = new FormData();
      fd.set("date", new Date().toISOString());
      fd.set("category", "project");
      fd.set("hours", "0");
      fd.set("minutes", String(settings.focus));
      fd.set("description", "Pomodoro focus session");
      createManualTimeEntry({}, fd);

      const nextPhase: Phase = nextCount % settings.sessionsBeforeLong === 0 ? "long_break" : "short_break";
      setPhase(nextPhase);
      setSecondsLeft((nextPhase === "long_break" ? settings.long : settings.short) * 60);
    } else {
      toast.info("Break's over. Ready for another session?");
      setPhase("focus");
      setSecondsLeft(settings.focus * 60);
    }
  }

  function reset() {
    setRunning(false);
    setPhase("focus");
    setSecondsLeft(settings.focus * 60);
    setCompletedSessions(0);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const total = phaseMinutes * 60;
  const progress = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;

  return (
    <Card className="py-4">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">Pomodoro</CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Pomodoro settings">
              <Settings2 className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <form
              action={(formData) => {
                const next = {
                  focus: Number(formData.get("focusMinutes")) || 25,
                  short: Number(formData.get("shortBreakMinutes")) || 5,
                  long: Number(formData.get("longBreakMinutes")) || 15,
                  sessionsBeforeLong: Number(formData.get("sessionsBeforeLongBreak")) || 4,
                };
                setSettings(next);
                if (!running) setSecondsLeft(next.focus * 60);
                updatePomodoroSettings(formData);
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <Label htmlFor="focusMinutes" className="text-xs">Focus (min)</Label>
                <Input id="focusMinutes" name="focusMinutes" type="number" min={1} defaultValue={settings.focus} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="shortBreakMinutes" className="text-xs">Short break (min)</Label>
                <Input id="shortBreakMinutes" name="shortBreakMinutes" type="number" min={1} defaultValue={settings.short} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="longBreakMinutes" className="text-xs">Long break (min)</Label>
                <Input id="longBreakMinutes" name="longBreakMinutes" type="number" min={1} defaultValue={settings.long} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sessionsBeforeLongBreak" className="text-xs">Sessions before long break</Label>
                <Input id="sessionsBeforeLongBreak" name="sessionsBeforeLongBreak" type="number" min={1} defaultValue={settings.sessionsBeforeLong} className="h-8" />
              </div>
              <Button type="submit" size="sm" className="w-full">Save</Button>
            </form>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative mx-auto flex size-36 items-center justify-center">
          <svg width="144" height="144" viewBox="0 0 144 144" className="absolute -rotate-90">
            <circle cx="72" cy="72" r="64" fill="none" stroke="var(--color-muted)" strokeWidth="8" />
            <circle
              cx="72"
              cy="72"
              r="64"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 64}
              strokeDashoffset={2 * Math.PI * 64 * (1 - progress / 100)}
            />
          </svg>
          <div className="text-center">
            <p className="font-mono text-3xl font-semibold tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
            <p className="text-xs text-muted-foreground">{PHASE_LABEL[phase]}</p>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <Button size="sm" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">{completedSessions} sessions completed</p>
      </CardContent>
    </Card>
  );
}
