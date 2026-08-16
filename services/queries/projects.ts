import type { SupabaseClient } from "@supabase/supabase-js";

import type { Bug, Project, ProjectMilestone, ActivityLogEntry, Task } from "@/types/database";

/** Lightweight project list for <select> pickers (Quick Add, task forms, etc). */
export async function getProjectOptions(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("projects")
    .select("id, name, slug")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  return data ?? [];
}

export async function getProjects(
  supabase: SupabaseClient,
  userId: string,
  opts: { archived?: boolean } = {}
): Promise<Project[]> {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", opts.archived ?? false)
    .order("updated_at", { ascending: false });

  return (data as Project[]) ?? [];
}

export interface ProjectDetail {
  project: Project;
  milestones: ProjectMilestone[];
  tasks: Task[];
  bugs: Bug[];
  activity: ActivityLogEntry[];
  hoursLogged: number;
}

export async function getProjectBySlug(
  supabase: SupabaseClient,
  userId: string,
  slug: string
): Promise<ProjectDetail | null> {
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();

  if (!project) return null;

  const [milestonesRes, tasksRes, bugsRes, activityRes, timeRes] = await Promise.all([
    supabase
      .from("project_milestones")
      .select("*")
      .eq("project_id", project.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("tasks")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false }),
    supabase.from("bugs").select("*").eq("project_id", project.id).order("created_at", { ascending: false }),
    supabase
      .from("activity_log")
      .select("*")
      .eq("project_id", project.id)
      .order("occurred_at", { ascending: false })
      .limit(30),
    supabase.from("time_entries").select("duration_minutes").eq("project_id", project.id),
  ]);

  const hoursLogged =
    (timeRes.data ?? []).reduce((sum, e) => sum + (e.duration_minutes ?? 0), 0) / 60;

  return {
    project: project as Project,
    milestones: (milestonesRes.data as ProjectMilestone[]) ?? [],
    tasks: (tasksRes.data as Task[]) ?? [],
    bugs: (bugsRes.data as Bug[]) ?? [],
    activity: (activityRes.data as ActivityLogEntry[]) ?? [],
    hoursLogged: Math.round(hoursLogged * 10) / 10,
  };
}
