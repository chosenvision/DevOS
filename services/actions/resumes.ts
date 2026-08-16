"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/services/auth";
import type { ResumeContent } from "@/types/database";

export type ActionState = { error?: string; success?: string; id?: string };

export async function createResume(formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Resume name is required." };

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      name,
      target_job: (formData.get("targetJob") as string) || null,
      is_ats_mode: true,
      content: {},
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create resume." };

  revalidatePath("/career/resume");
  redirect(`/career/resume/${data.id}`);
}

export async function duplicateResume(resumeId: string) {
  const { supabase, user } = await requireUser();

  const { data: original } = await supabase.from("resumes").select("*").eq("id", resumeId).single();
  if (!original) return { error: "Resume not found." };

  const { error } = await supabase.from("resumes").insert({
    user_id: user.id,
    name: `${original.name} (copy)`,
    target_job: original.target_job,
    is_ats_mode: original.is_ats_mode,
    is_portfolio_mode: original.is_portfolio_mode,
    content: original.content,
  });

  revalidatePath("/career/resume");
  return { error: error?.message };
}

export async function renameResume(resumeId: string, name: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("resumes").update({ name }).eq("id", resumeId).eq("user_id", user.id);
  revalidatePath("/career/resume");
  return { error: error?.message };
}

export async function deleteResume(resumeId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("resumes").delete().eq("id", resumeId).eq("user_id", user.id);
  revalidatePath("/career/resume");
  return { error: error?.message };
}

export async function updateResumeContent(resumeId: string, content: ResumeContent, options?: { atsMode?: boolean; portfolioMode?: boolean }) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("resumes")
    .update({
      content,
      ...(options?.atsMode !== undefined ? { is_ats_mode: options.atsMode } : {}),
      ...(options?.portfolioMode !== undefined ? { is_portfolio_mode: options.portfolioMode } : {}),
    })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  revalidatePath(`/career/resume/${resumeId}`);
  return { error: error?.message };
}

/** Pulls projects/skills/certifications already in DevOS into the resume's content. */
export async function generateResumeFromData(resumeId: string) {
  const { supabase, user } = await requireUser();

  const [projectsRes, skillsRes, certsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("name, description, tech_stack, live_url")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("skills")
      .select("name, level")
      .eq("user_id", user.id)
      .in("level", ["advanced", "confident", "intermediate"]),
    supabase.from("certifications").select("name, provider").eq("user_id", user.id),
  ]);

  const { data: resume } = await supabase.from("resumes").select("content").eq("id", resumeId).single();
  const existing = (resume?.content ?? {}) as ResumeContent;

  const content: ResumeContent = {
    ...existing,
    projects: (projectsRes.data ?? []).map((p) => ({
      name: p.name,
      description: p.description ?? "",
      tech: p.tech_stack ?? [],
      url: p.live_url ?? undefined,
    })),
    skills: (skillsRes.data ?? []).map((s) => s.name),
    certifications: (certsRes.data ?? []).map((c) => `${c.name} — ${c.provider}`),
  };

  const { error } = await supabase.from("resumes").update({ content }).eq("id", resumeId).eq("user_id", user.id);

  revalidatePath(`/career/resume/${resumeId}`);
  return { error: error?.message };
}
