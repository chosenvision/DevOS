import type { SupabaseClient } from "@supabase/supabase-js";

import { daysAgo } from "@/lib/analytics";
import type { CalendarEventType } from "@/types/database";

export interface AggregatedCalendarItem {
  id: string;
  title: string;
  date: string;
  type: CalendarEventType;
  href: string;
  draggable?: boolean;
}

export async function getCalendarItems(
  supabase: SupabaseClient,
  userId: string
): Promise<AggregatedCalendarItem[]> {
  const since = daysAgo(60).toISOString();
  const untilDate = new Date();
  untilDate.setDate(untilDate.getDate() + 180);

  const [tasksRes, projectsRes, applicationsRes, coursesRes, goalsRes, eventsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, due_date")
      .eq("user_id", userId)
      .not("due_date", "is", null)
      .neq("status", "completed")
      .gte("due_date", since),
    supabase
      .from("projects")
      .select("id, name, slug, deadline")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .not("deadline", "is", null),
    supabase
      .from("job_applications")
      .select("id, company_name, position, interview_date")
      .eq("user_id", userId)
      .not("interview_date", "is", null),
    supabase
      .from("courses")
      .select("id, name, target_completion_date")
      .eq("user_id", userId)
      .not("target_completion_date", "is", null)
      .neq("status", "completed"),
    supabase
      .from("goals")
      .select("id, title, deadline")
      .eq("user_id", userId)
      .not("deadline", "is", null)
      .neq("status", "completed"),
    supabase
      .from("calendar_events")
      .select("id, title, event_type, start_at")
      .eq("user_id", userId)
      .gte("start_at", since)
      .lte("start_at", untilDate.toISOString()),
  ]);

  const items: AggregatedCalendarItem[] = [];

  for (const t of tasksRes.data ?? []) {
    items.push({ id: `task-${t.id}`, title: t.title, date: t.due_date, type: "task", href: "/tasks", draggable: true });
  }
  for (const p of projectsRes.data ?? []) {
    items.push({ id: `project-${p.id}`, title: p.name, date: p.deadline, type: "deadline", href: `/projects/${p.slug}` });
  }
  for (const a of applicationsRes.data ?? []) {
    items.push({
      id: `application-${a.id}`,
      title: `${a.position} at ${a.company_name}`,
      date: a.interview_date,
      type: "interview",
      href: "/career/applications",
    });
  }
  for (const c of coursesRes.data ?? []) {
    items.push({ id: `course-${c.id}`, title: c.name, date: c.target_completion_date, type: "course_deadline", href: "/learning/courses" });
  }
  for (const g of goalsRes.data ?? []) {
    items.push({ id: `goal-${g.id}`, title: g.title, date: g.deadline, type: "goal", href: "/analytics" });
  }
  for (const e of eventsRes.data ?? []) {
    items.push({ id: `event-${e.id}`, title: e.title, date: e.start_at, type: e.event_type, href: "/calendar" });
  }

  return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
