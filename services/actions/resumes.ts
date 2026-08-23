"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/services/auth";
import { tailorResume } from "@/lib/ai/resume-tailor";
import { AiNotConfiguredError } from "@/lib/ai/client";
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

/**
 * Tailors a resume for a specific job using AI (reorders/rewords existing
 * content only — see lib/ai/resume-tailor.ts for the hard "never invent"
 * rules and the validation that actually enforces them). Saves the result
 * as a brand-new resume row; the source resume is never modified.
 */
export async function tailorResumeForJob(resumeId: string, jobListingId: string): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const [{ data: source }, { data: job }] = await Promise.all([
    supabase.from("resumes").select("*").eq("id", resumeId).eq("user_id", user.id).maybeSingle(),
    supabase.from("job_listings").select("*").eq("id", jobListingId).eq("user_id", user.id).maybeSingle(),
  ]);

  if (!source) return { error: "Resume not found." };
  if (!job) return { error: "Job not found." };

  try {
    const result = await tailorResume({
      source: source.content as ResumeContent,
      jobTitle: job.title,
      companyName: job.company_name,
      jobDescription: job.description,
      jobSkills: job.skills ?? [],
    });

    const { data: created, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        name: `${source.name} — ${job.company_name}`,
        target_job: job.title,
        is_ats_mode: source.is_ats_mode,
        content: result.content,
        parent_resume_id: source.id,
        tailored_for_job_id: job.id,
        change_summary: result.changeSummary,
      })
      .select("id")
      .single();

    if (error || !created) return { error: error?.message ?? "Could not save the tailored resume." };

    revalidatePath("/career/resume");
    return { success: "Resume tailored and saved as a new version.", id: created.id as string };
  } catch (err) {
    if (err instanceof AiNotConfiguredError) return { error: err.message };
    return { error: err instanceof Error ? err.message : "Could not tailor resume." };
  }
}
