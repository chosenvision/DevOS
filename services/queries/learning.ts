import type { SupabaseClient } from "@supabase/supabase-js";

import type { Certification, Course, Resource, Roadmap, RoadmapStep, Skill } from "@/types/database";

export async function getCourses(supabase: SupabaseClient, userId: string): Promise<Course[]> {
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return (data as Course[]) ?? [];
}

export async function getSkills(supabase: SupabaseClient, userId: string): Promise<Skill[]> {
  const { data } = await supabase.from("skills").select("*").eq("user_id", userId).order("name");
  return (data as Skill[]) ?? [];
}

export async function getResources(supabase: SupabaseClient, userId: string): Promise<Resource[]> {
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("user_id", userId)
    .order("date_added", { ascending: false });
  return (data as Resource[]) ?? [];
}

export async function getCertifications(supabase: SupabaseClient, userId: string): Promise<Certification[]> {
  const { data } = await supabase
    .from("certifications")
    .select("*")
    .eq("user_id", userId)
    .order("date_earned", { ascending: false });
  return (data as Certification[]) ?? [];
}

export interface RoadmapWithSteps extends Roadmap {
  steps: RoadmapStep[];
}

export async function getRoadmaps(supabase: SupabaseClient, userId: string): Promise<RoadmapWithSteps[]> {
  const { data: roadmaps } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!roadmaps || roadmaps.length === 0) return [];

  const { data: steps } = await supabase
    .from("roadmap_steps")
    .select("*")
    .in("roadmap_id", roadmaps.map((r) => r.id))
    .order("sort_order", { ascending: true });

  return roadmaps.map((r) => ({
    ...r,
    steps: (steps ?? []).filter((s) => s.roadmap_id === r.id),
  })) as RoadmapWithSteps[];
}

export interface LearningOverview {
  activeCourses: Course[];
  skillCount: number;
  hoursPracticedTotal: number;
  currentRoadmapStep: (RoadmapStep & { roadmapTitle: string }) | null;
  recentResources: Resource[];
  certificationCount: number;
}

export async function getLearningOverview(
  supabase: SupabaseClient,
  userId: string
): Promise<LearningOverview> {
  const [coursesRes, skillsRes, roadmaps, resourcesRes, certsRes] = await Promise.all([
    supabase
      .from("courses")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("updated_at", { ascending: false })
      .limit(4),
    supabase.from("skills").select("hours_practiced").eq("user_id", userId),
    getRoadmaps(supabase, userId),
    supabase
      .from("resources")
      .select("*")
      .eq("user_id", userId)
      .order("date_added", { ascending: false })
      .limit(4),
    supabase.from("certifications").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  const skills = skillsRes.data ?? [];
  const currentStep = roadmaps
    .flatMap((r) => r.steps.map((s) => ({ ...s, roadmapTitle: r.title })))
    .find((s) => s.status === "current");

  return {
    activeCourses: (coursesRes.data as Course[]) ?? [],
    skillCount: skills.length,
    hoursPracticedTotal: skills.reduce((sum, s) => sum + Number(s.hours_practiced ?? 0), 0),
    currentRoadmapStep: currentStep ?? null,
    recentResources: (resourcesRes.data as Resource[]) ?? [],
    certificationCount: certsRes.count ?? 0,
  };
}
