"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { resourceSchema } from "@/lib/validations/career";

export type ActionState = { error?: string; success?: string };

export async function createResource(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = resourceSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url") || undefined,
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
    description: formData.get("description") || undefined,
    status: formData.get("status") || "unread",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from("resources").insert({
    user_id: user.id,
    title: parsed.data.title,
    url: parsed.data.url || null,
    category: parsed.data.category || null,
    tags,
    description: parsed.data.description || null,
    status: parsed.data.status,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/learning/resources");
  return { success: "Resource saved." };
}

export async function createCourse(formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Course name is required." };

  const { error } = await supabase.from("courses").insert({
    user_id: user.id,
    name,
    platform: String(formData.get("platform") || "Other"),
    instructor: (formData.get("instructor") as string) || null,
    url: (formData.get("url") as string) || null,
    status: (formData.get("status") as string) || "not_started",
    total_lessons: formData.get("totalLessons") ? Number(formData.get("totalLessons")) : null,
    estimated_duration_minutes: formData.get("estimatedDuration")
      ? Number(formData.get("estimatedDuration"))
      : null,
    start_date: (formData.get("startDate") as string) || null,
    target_completion_date: (formData.get("targetDate") as string) || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/learning/courses");
  revalidatePath("/dashboard");
  return { success: "Course added." };
}

export async function updateCourseProgress(courseId: string, progress: number, status?: string) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("courses")
    .update({
      progress,
      status: status ?? (progress >= 100 ? "completed" : "in_progress"),
      completed_at: progress >= 100 ? new Date().toISOString() : null,
    })
    .eq("id", courseId)
    .eq("user_id", user.id);

  revalidatePath("/learning/courses");
  return { error: error?.message };
}

export async function createSkill(formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Skill name is required." };

  const { error } = await supabase.from("skills").insert({
    user_id: user.id,
    name,
    category: (formData.get("category") as string) || null,
    level: (formData.get("level") as string) || "learning",
  });

  if (error) {
    if (error.code === "23505") return { error: "You already have that skill tracked." };
    return { error: error.message };
  }

  revalidatePath("/learning/skills");
  return { success: "Skill added." };
}

export async function updateSkillLevel(skillId: string, level: string) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("skills")
    .update({ level })
    .eq("id", skillId)
    .eq("user_id", user.id);

  revalidatePath("/learning/skills");
  return { error: error?.message };
}

export async function deleteSkill(skillId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("skills").delete().eq("id", skillId).eq("user_id", user.id);
  revalidatePath("/learning/skills");
  return { error: error?.message };
}

// ---------- Roadmaps ----------

export async function createRoadmap(formData: FormData): Promise<ActionState & { id?: string }> {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Roadmap title is required." };

  const { data, error } = await supabase
    .from("roadmaps")
    .insert({ user_id: user.id, title, description: (formData.get("description") as string) || null })
    .select("id")
    .single();

  revalidatePath("/learning/roadmap");
  return { error: error?.message, id: data?.id };
}

export async function addRoadmapStep(roadmapId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Step title is required." };

  const { data: existing } = await supabase.from("roadmap_steps").select("id").eq("roadmap_id", roadmapId);

  const { error } = await supabase.from("roadmap_steps").insert({
    roadmap_id: roadmapId,
    user_id: user.id,
    title,
    description: (formData.get("description") as string) || null,
    resource_url: (formData.get("resourceUrl") as string) || null,
    status: (existing?.length ?? 0) === 0 ? "current" : "upcoming",
    sort_order: existing?.length ?? 0,
  });

  revalidatePath("/learning/roadmap");
  return { error: error?.message };
}

export async function updateRoadmapStepStatus(stepId: string, status: string) {
  const { supabase, user } = await requireUser();

  const { data: step } = await supabase
    .from("roadmap_steps")
    .select("roadmap_id, sort_order")
    .eq("id", stepId)
    .single();

  const { error } = await supabase
    .from("roadmap_steps")
    .update({ status })
    .eq("id", stepId)
    .eq("user_id", user.id);

  if (!error && step && status === "completed") {
    const { data: next } = await supabase
      .from("roadmap_steps")
      .select("id, status")
      .eq("roadmap_id", step.roadmap_id)
      .gt("sort_order", step.sort_order)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next && next.status === "upcoming") {
      await supabase.from("roadmap_steps").update({ status: "current" }).eq("id", next.id);
    }
  }

  revalidatePath("/learning/roadmap");
  return { error: error?.message };
}

export async function deleteRoadmap(roadmapId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("roadmaps").delete().eq("id", roadmapId).eq("user_id", user.id);
  revalidatePath("/learning/roadmap");
  return { error: error?.message };
}

// ---------- Certifications ----------

export async function createCertification(formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") || "").trim();
  const provider = String(formData.get("provider") || "").trim();
  if (!name || !provider) return { error: "Name and provider are required." };

  const skills = String(formData.get("skills") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("certifications").insert({
    user_id: user.id,
    name,
    provider,
    date_earned: (formData.get("dateEarned") as string) || null,
    expiration_date: (formData.get("expirationDate") as string) || null,
    credential_id: (formData.get("credentialId") as string) || null,
    credential_url: (formData.get("credentialUrl") as string) || null,
    skills,
  });

  if (error) return { error: error.message };

  revalidatePath("/learning/certifications");
  return { success: "Certification added." };
}

export async function deleteCertification(certId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("certifications").delete().eq("id", certId).eq("user_id", user.id);
  revalidatePath("/learning/certifications");
  return { error: error?.message };
}

export async function updateResourceStatus(resourceId: string, status: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("resources")
    .update({ status })
    .eq("id", resourceId)
    .eq("user_id", user.id);
  revalidatePath("/learning/resources");
  return { error: error?.message };
}

export async function deleteResource(resourceId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("resources").delete().eq("id", resourceId).eq("user_id", user.id);
  revalidatePath("/learning/resources");
  return { error: error?.message };
}
