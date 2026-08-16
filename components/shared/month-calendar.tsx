"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarItem {
  id: string;
  date: string;
  render: React.ReactNode;
}

interface MonthCalendarProps {
  items: CalendarItem[];
  month?: Date;
  onMonthChange?: (month: Date) => void;
  onDayClick?: (date: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function MonthCalendar({ items, month, onMonthChange, onDayClick }: MonthCalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState(() => month ?? new Date());
  const activeMonth = month ?? internalMonth;

  function changeMonth(delta: number) {
    const next = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + delta, 1);
    setInternalMonth(next);
    onMonthChange?.(next);
  }

  const itemsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const key = item.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [items]);

  const firstOfMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0).getDate();
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - startOffset);

  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const today = toKey(new Date());

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium">
          {activeMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => changeMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setInternalMonth(new Date()); onMonthChange?.(new Date()); }}>
            Today
          </Button>
          <Button size="icon" variant="ghost" onClick={() => changeMonth(1)} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-border text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          const key = toKey(date);
          const inMonth = date.getMonth() === activeMonth.getMonth();
          const dayItems = itemsByDay.get(key) ?? [];
          return (
            <button
              type="button"
              key={i}
              onClick={() => onDayClick?.(date)}
              className={cn(
                "flex min-h-24 flex-col gap-1 border-b border-r border-border p-1.5 text-left align-top",
                !inMonth && "bg-muted/30 text-muted-foreground/50",
                (i + 1) % 7 === 0 && "border-r-0"
              )}
            >
              <span className={cn("text-xs", key === today && "flex size-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground")}>
                {date.getDate()}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="truncate">{item.render}</div>
                ))}
                {dayItems.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{dayItems.length - 3} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
