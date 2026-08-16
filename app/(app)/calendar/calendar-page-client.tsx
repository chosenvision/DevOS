"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MonthCalendar, type CalendarItem } from "@/components/shared/month-calendar";
import { EventFormDialog } from "@/components/calendar/event-form-dialog";
import { EventTypeBadge } from "@/components/calendar/event-type-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { rescheduleTask } from "@/services/actions/tasks";
import { formatDateTime, formatShortDate } from "@/lib/utils";
import type { AggregatedCalendarItem } from "@/services/queries/calendar";

function AgendaList({ items }: { items: AggregatedCalendarItem[] }) {
  const upcoming = items.filter((i) => new Date(i.date) >= new Date(new Date().toDateString()));

  if (upcoming.length === 0) {
    return <EmptyState title="Nothing scheduled." description="Deadlines, interviews, and events will show up here." />;
  }

  const grouped = new Map<string, AggregatedCalendarItem[]>();
  for (const item of upcoming) {
    const key = item.date.slice(0, 10);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  return (
    <div className="space-y-5">
      {[...grouped.entries()].map(([date, dayItems]) => (
        <div key={date}>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{formatShortDate(date)}</p>
          <div className="space-y-1.5">
            {dayItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm hover:border-primary/40"
              >
                <span className="min-w-0 truncate">{item.title}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <EventTypeBadge type={item.type} />
                  <span className="text-xs text-muted-foreground">{formatDateTime(item.date)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WeekStrip({ items }: { items: AggregatedCalendarItem[] }) {
  const [weekStart, setWeekStart] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const itemsByDay = React.useMemo(() => {
    const map = new Map<string, AggregatedCalendarItem[]>();
    for (const item of items) {
      const key = item.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [items]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
          {days[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}>
            Previous
          </Button>
          <Button size="sm" variant="outline" onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}>
            Next
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const dayItems = itemsByDay.get(key) ?? [];
          const isToday = key === new Date().toISOString().slice(0, 10);
          return (
            <div key={key} className="min-h-40 rounded-lg border border-border p-2">
              <p className={`mb-1.5 text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {day.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
              </p>
              <div className="space-y-1">
                {dayItems.map((item) => (
                  <Link key={item.id} href={item.href} className="block truncate rounded bg-secondary px-1.5 py-1 text-[11px] hover:bg-secondary/70">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayView({ items }: { items: AggregatedCalendarItem[] }) {
  const [day, setDay] = React.useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const key = day.toISOString().slice(0, 10);
  const dayItems = items.filter((i) => i.date.slice(0, 10) === key);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => setDay((d) => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; })}>
            Previous
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDay(new Date(new Date().setHours(0, 0, 0, 0)))}>
            Today
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDay((d) => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; })}>
            Next
          </Button>
        </div>
      </div>
      {dayItems.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Nothing scheduled for this day.</p>
      ) : (
        <div className="space-y-1.5">
          {dayItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm hover:border-primary/40"
            >
              <span className="min-w-0 truncate">{item.title}</span>
              <div className="flex shrink-0 items-center gap-2">
                <EventTypeBadge type={item.type} />
                <span className="text-xs text-muted-foreground">{formatDateTime(item.date)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function CalendarPageClient({ items }: { items: AggregatedCalendarItem[] }) {
  const [open, setOpen] = React.useState(false);

  const calendarItems: CalendarItem[] = items.map((item) => ({
    id: item.id,
    date: item.date,
    draggable: item.draggable,
    render: (
      <Link href={item.href} className="block truncate rounded bg-secondary px-1 text-[11px] hover:bg-secondary/70">
        {item.title}
      </Link>
    ),
  }));

  async function handleDrop(itemId: string, newDate: Date) {
    if (!itemId.startsWith("task-")) return;
    const taskId = itemId.replace("task-", "");
    const res = await rescheduleTask(taskId, newDate.toISOString());
    if (res.error) toast.error(res.error);
    else toast.success("Task rescheduled.");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New event
        </Button>
      </div>

      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="month">
            <MonthCalendar items={calendarItems} onItemDrop={handleDrop} />
            <p className="mt-2 text-xs text-muted-foreground">Tip: drag a task to a new day to reschedule it.</p>
          </TabsContent>
          <TabsContent value="week">
            <WeekStrip items={items} />
          </TabsContent>
          <TabsContent value="day">
            <DayView items={items} />
          </TabsContent>
          <TabsContent value="agenda">
            <AgendaList items={items} />
          </TabsContent>
        </div>
      </Tabs>

      <EventFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
