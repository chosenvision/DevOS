import type { SupabaseClient } from "@supabase/supabase-js";

import { computeCurrentStreak, daysAgo, computeProductivityScore } from "@/lib/analytics";
import type { Project, Task, ProjectMilestone } from "@/types/database";

export interface KpiValue {
  value: number;
  previous: number;
}

export interface DashboardSummary {
  activeProjects: KpiValue;
  tasksDueToday: KpiValue;
  codingHoursThisWeek: KpiValue;
  codingStreak: number;
  learningHoursThisWeek: KpiValue;
  applications: KpiValue;
  upcomingInterviews: KpiValue;
  githubConnected: boolean;
}

/** One pass over the last 14 days of time entries + counts needed for the dashboard KPI row. */
export async function getDashboardSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardSummary> {
  const since14 = daysAgo(14).toISOString();
  const since60 = daysAgo(60).toISOString();
  const todayStart = daysAgo(0).toISOString();
  const todayEnd = new Date(daysAgo(0).getTime() + 86400000).toISOString();

  const [
    projectsRes,
    tasksTodayRes,
    timeEntriesRes,
    streakEntriesRes,
    applicationsRes,
    interviewsRes,
    githubRes,
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, status, is_archived, created_at")
      .eq("user_id", userId)
      .eq("is_archived", false),
    supabase
      .from("tasks")
      .select("id, status, due_date")
      .eq("user_id", userId)
      .gte("due_date", daysAgo(7).toISOString())
      .lt("due_date", todayEnd),
    supabase
      .from("time_entries")
      .select("category, duration_minutes, started_at, is_running")
      .eq("user_id", userId)
      .gte("started_at", since14),
    supabase
      .from("time_entries")
      .select("started_at")
      .eq("user_id", userId)
      .eq("category", "project")
      .gte("started_at", since60),
    supabase
      .from("job_applications")
      .select("id, status, created_at")
      .eq("user_id", userId),
    supabase
      .from("job_applications")
      .select("id, interview_date, created_at")
      .eq("user_id", userId)
      .not("interview_date", "is", null),
    supabase.from("github_connections").select("user_id").eq("user_id", userId).maybeSingle(),
  ]);

  const projects = projectsRes.data ?? [];
  const activeProjects = projects.filter((p) =>
    ["planning", "in_progress", "testing"].includes(p.status)
  ).length;
  const activeProjectsPrev = projects.filter(
    (p) => new Date(p.created_at) < daysAgo(7) && ["planning", "in_progress", "testing"].includes(p.status)
  ).length;

  const dueDateWindow = tasksTodayRes.data ?? [];
  const tasksDueToday = dueDateWindow.filter(
    (t) => t.status !== "completed" && new Date(t.due_date) >= new Date(todayStart) && new Date(t.due_date) < new Date(todayEnd)
  ).length;
  const tasksDueSameDayLastWeek = dueDateWindow.filter((t) => {
    const due = new Date(t.due_date);
    return due >= daysAgo(7) && due < new Date(daysAgo(7).getTime() + 86400000);
  }).length;

  const entries = timeEntriesRes.data ?? [];
  const weekAgo = daysAgo(7);
  const twoWeeksAgo = daysAgo(14);

  const sumMinutes = (category: string, from: Date, to: Date) =>
    entries
      .filter(
        (e) =>
          e.category === category &&
          new Date(e.started_at) >= from &&
          new Date(e.started_at) < to
      )
      .reduce((sum, e) => sum + (e.duration_minutes ?? 0), 0);

  const codingHoursThisWeek = sumMinutes("project", weekAgo, new Date()) / 60;
  const codingHoursLastWeek = sumMinutes("project", twoWeeksAgo, weekAgo) / 60;
  const learningHoursThisWeek = sumMinutes("learning", weekAgo, new Date()) / 60;
  const learningHoursLastWeek = sumMinutes("learning", twoWeeksAgo, weekAgo) / 60;

  const streakDates = (streakEntriesRes.data ?? []).map((e) => e.started_at);
  const codingStreak = computeCurrentStreak(streakDates);

  const applications = applicationsRes.data ?? [];
  const activeApplications = applications.filter(
    (a) => !["rejected", "withdrawn"].includes(a.status)
  ).length;
  const activeApplicationsPrev = applications.filter(
    (a) =>
      new Date(a.created_at) < weekAgo && !["rejected", "withdrawn"].includes(a.status)
  ).length;

  const interviews = interviewsRes.data ?? [];
  const in14Days = new Date(Date.now() + 14 * 86400000);
  const upcomingInterviews = interviews.filter(
    (a) => a.interview_date && new Date(a.interview_date) >= new Date() && new Date(a.interview_date) <= in14Days
  ).length;

  return {
    activeProjects: { value: activeProjects, previous: activeProjectsPrev },
    tasksDueToday: { value: tasksDueToday, previous: tasksDueSameDayLastWeek },
    codingHoursThisWeek: { value: codingHoursThisWeek, previous: codingHoursLastWeek },
    codingStreak,
    learningHoursThisWeek: { value: learningHoursThisWeek, previous: learningHoursLastWeek },
    applications: { value: activeApplications, previous: activeApplicationsPrev },
    upcomingInterviews: { value: upcomingInterviews, previous: upcomingInterviews },
    githubConnected: !!githubRes.data,
  };
}

export interface TodayData {
  tasks: Task[];
  deadlines: { title: string; date: string; type: string; href: string }[];
  interviews: { title: string; date: string; href: string }[];
}

export async function getTodayData(supabase: SupabaseClient, userId: string): Promise<TodayData> {
  const todayStart = daysAgo(0);
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const in7Days = new Date(Date.now() + 7 * 86400000);
  const in14Days = new Date(Date.now() + 14 * 86400000);

  const [tasksRes, upcomingTasksRes, projectsRes, coursesRes, applicationsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, project:projects(id, name, slug)")
      .eq("user_id", userId)
      .gte("due_date", todayStart.toISOString())
      .lt("due_date", todayEnd.toISOString())
      .neq("status", "completed")
      .order("priority", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, title, due_date, project:projects(slug)")
      .eq("user_id", userId)
      .gt("due_date", todayEnd.toISOString())
      .lte("due_date", in7Days.toISOString())
      .neq("status", "completed"),
    supabase
      .from("projects")
      .select("id, name, slug, deadline")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .not("deadline", "is", null)
      .gte("deadline", todayStart.toISOString().slice(0, 10))
      .lte("deadline", in14Days.toISOString().slice(0, 10)),
    supabase
      .from("courses")
      .select("id, name, target_completion_date")
      .eq("user_id", userId)
      .not("target_completion_date", "is", null)
      .gte("target_completion_date", todayStart.toISOString().slice(0, 10))
      .lte("target_completion_date", in14Days.toISOString().slice(0, 10)),
    supabase
      .from("job_applications")
      .select("id, company_name, position, interview_date")
      .eq("user_id", userId)
      .not("interview_date", "is", null)
      .gte("interview_date", todayStart.toISOString())
      .lte("interview_date", in14Days.toISOString()),
  ]);

  const deadlines: TodayData["deadlines"] = [
    ...(upcomingTasksRes.data ?? []).map((t) => ({
      title: t.title,
      date: t.due_date as string,
      type: "Task",
      href: "/tasks",
    })),
    ...(projectsRes.data ?? []).map((p) => ({
      title: p.name,
      date: p.deadline as string,
      type: "Project deadline",
      href: `/projects/${p.slug}`,
    })),
    ...(coursesRes.data ?? []).map((c) => ({
      title: c.name,
      date: c.target_completion_date as string,
      type: "Course",
      href: "/learning/courses",
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const interviews = (applicationsRes.data ?? []).map((a) => ({
    title: `${a.position} at ${a.company_name}`,
    date: a.interview_date as string,
    href: "/career/applications",
  }));

  return {
    tasks: (tasksRes.data ?? []) as unknown as Task[],
    deadlines,
    interviews,
  };
}

export interface CurrentProjectData {
  project: Project;
  tasksRemaining: number;
  tasksTotal: number;
  currentMilestone: ProjectMilestone | null;
}

export async function getCurrentProject(
  supabase: SupabaseClient,
  userId: string
): Promise<CurrentProjectData | null> {
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .eq("status", "in_progress")
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!project) return null;

  const [tasksRes, milestoneRes] = await Promise.all([
    supabase.from("tasks").select("status").eq("project_id", project.id),
    supabase
      .from("project_milestones")
      .select("*")
      .eq("project_id", project.id)
      .neq("status", "completed")
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const tasks = tasksRes.data ?? [];

  return {
    project: project as Project,
    tasksTotal: tasks.length,
    tasksRemaining: tasks.filter((t) => t.status !== "completed").length,
    currentMilestone: (milestoneRes.data as ProjectMilestone | null) ?? null,
  };
}

export interface ProductivitySignals {
  score: number;
}

export async function getProductivityScore(
  supabase: SupabaseClient,
  userId: string
): Promise<ProductivitySignals> {
  const weekAgo = daysAgo(7).toISOString();

  const [tasksRes, timeEntriesRes, projectsRes, goalsRes] = await Promise.all([
    supabase.from("tasks").select("status, due_date, completed_at").eq("user_id", userId).gte("due_date", weekAgo),
    supabase
      .from("time_entries")
      .select("category, started_at")
      .eq("user_id", userId)
      .gte("started_at", weekAgo),
    supabase
      .from("projects")
      .select("progress")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .neq("status", "completed"),
    supabase.from("goals").select("progress, status").eq("user_id", userId).eq("status", "in_progress"),
  ]);

  const tasks = tasksRes.data ?? [];
  const taskCompletionRate =
    tasks.length === 0 ? 60 : (tasks.filter((t) => t.status === "completed").length / tasks.length) * 100;

  const entries = timeEntriesRes.data ?? [];
  const codingDays = new Set(
    entries.filter((e) => e.category === "project").map((e) => e.started_at.slice(0, 10))
  ).size;
  const learningDays = new Set(
    entries.filter((e) => e.category === "learning").map((e) => e.started_at.slice(0, 10))
  ).size;

  const projects = projectsRes.data ?? [];
  const projectProgress =
    projects.length === 0 ? 50 : projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;

  const goals = goalsRes.data ?? [];
  const goalCompletion =
    goals.length === 0 ? 50 : goals.reduce((sum, g) => sum + g.progress, 0) / goals.length;

  const score = computeProductivityScore({
    taskCompletionRate,
    codingConsistency: (codingDays / 7) * 100,
    learningConsistency: (learningDays / 7) * 100,
    projectProgress,
    goalCompletion,
  });

  return { score };
}
