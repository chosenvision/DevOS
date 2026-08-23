"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { generateCoverLetter } from "@/lib/ai/cover-letter";
import { AiNotConfiguredError } from "@/lib/ai/client";
import type { CareerProfile, ResumeContent } from "@/types/database";

export type ActionState = { error?: string; success?: string; letter?: string };

export async function generateCoverLetterForJob(jobId: string, resumeId?: string): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const [{ data: job }, { data: profile }, { data: profileRow }, resumeRes] = await Promise.all([
    supabase.from("job_listings").select("*").eq("id", jobId).eq("user_id", user.id).maybeSingle(),
    supabase.from("career_profiles").select("professional_summary, skills").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    resumeId
      ? supabase.from("resumes").select("content").eq("id", resumeId).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!job) return { error: "Job not found." };

  const resumeContent = (resumeRes.data?.content ?? {}) as ResumeContent;
  const careerProfile = (profile ?? { professional_summary: null, skills: [] }) as Pick<
    CareerProfile,
    "professional_summary" | "skills"
  >;

  try {
    const letter = await generateCoverLetter({
      profile: careerProfile,
      resumeSummary: resumeContent.summary,
      resumeExperience: resumeContent.experience,
      applicantName: profileRow?.full_name?.split(" ")[0] ?? "there",
      jobTitle: job.title,
      companyName: job.company_name,
      jobDescription: job.description,
    });

    return { success: "Cover letter drafted.", letter };
  } catch (err) {
    if (err instanceof AiNotConfiguredError) return { error: err.message };
    return { error: err instanceof Error ? err.message : "Could not generate cover letter." };
  }
}

export async function saveCoverLetterToApplication(applicationId: string, letter: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("job_applications")
    .update({ cover_letter_used: letter })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  revalidatePath("/career/applications");
  return { error: error?.message };
}
