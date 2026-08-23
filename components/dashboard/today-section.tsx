"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock, MessagesSquare, ListTodo } from "lucide-react";

import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toggleTaskCompleted } from "@/services/actions/tasks";
import { PRIORITY_BADGE, PRIORITY_LABEL } from "@/lib/constants";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";
import type { Task } from "@/types/database";
import type { TodayData } from "@/services/queries/dashboard";

function TaskRow({ task }: { task: Task }) {
  const [completed, setCompleted] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  return (
    <li className="flex items-center gap-3 py-2">
      <Checkbox
        checked={completed}
        disabled={pending}
        onCheckedChange={(checked) => {
          setCompleted(!!checked);
          startTransition(async () => {
            const res = await toggleTaskCompleted(task.id, !!checked);
            if (res.error) {
              setCompleted(!checked);
              toast.error(res.error);
            }
          });
        }}
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${completed ? "text-muted-foreground line-through" : ""}`}>
          {task.title}
        </p>
        {task.project && <p className="truncate text-xs text-muted-foreground">{task.project.name}</p>}
      </div>
      <Badge variant={PRIORITY_BADGE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
    </li>
  );
}

export function TodaySection({ data }: { data: TodayData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="py-4">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ListTodo className="size-4" /> Today&apos;s Tasks
          </CardTitle>
          <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {data.tasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing due today. Enjoy the clear runway.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="py-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarClock className="size-4" /> Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.deadlines.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Nothing on the horizon.</p>
            ) : (
              <ul className="space-y-2.5">
                {data.deadlines.slice(0, 5).map((d, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={d.href} className="min-w-0 truncate hover:underline">
                      {d.title}
                    </Link>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(d.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessagesSquare className="size-4" /> Interview Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.interviews.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No interviews scheduled.</p>
            ) : (
              <ul className="space-y-2.5">
                {data.interviews.map((i, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={i.href} className="min-w-0 truncate hover:underline">
                      {i.title}
                    </Link>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(i.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
