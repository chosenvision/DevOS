"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { HabitEntry } from "@/types/database";

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function HabitHeatmap({ entries, color }: { entries: HabitEntry[]; color: string }) {
  const entrySet = React.useMemo(() => new Set(entries.filter((e) => e.is_completed).map((e) => e.entry_date)), [entries]);

  const weeks = 26;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (weeks * 7 - 1) - today.getDay());

  const days = Array.from({ length: weeks * 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const columns: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-1">
          {col.map((day) => {
            const key = toKey(day);
            const completed = entrySet.has(key);
            const future = day > today;
            return (
              <div
                key={key}
                title={`${day.toLocaleDateString()}${completed ? " — done" : ""}`}
                className={cn("size-2.5 rounded-sm", future && "opacity-0")}
                style={{ backgroundColor: completed ? color : "var(--color-muted)" }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
