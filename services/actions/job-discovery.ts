"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { logActivity } from "@/services/activity";
import { computeAndSaveMatch, type ActionState } from "@/services/actions/career";
import { searchArbeitnowJobs, type LiveJobResult, type LiveJobSearchResult } from "@/lib/job-sources/arbeitnow";

/** Live job search — currently backed by Arbeitnow (free, keyless). Gated behind auth like every other Server Action, even though the underlying data is public. */
export async function searchLiveJobs(query: string): Promise<LiveJobSearchResult> {
  await requireUser();
  return searchArbeitnowJobs(query || undefined);
}

/** Saves a live search result into job_listings and scores it against the user's Career Profile — same pipeline as a manually-added job. */
export async function saveLiveJob(job: LiveJobResult): Promise<ActionState & { id?: string }> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("job_listings")
    .select("id")
    .eq("user_id", user.id)
    .eq("url", job.url)
    .maybeSingle();

  if (existing) {
    return { success: "Already saved.", id: existing.id as string };
  }

  const { data: inserted, error } = await supabase
    .from("job_listings")
    .insert({
      user_id: user.id,
      title: job.title,
      company_name: job.companyName,
      location: job.location,
      work_mode: job.remote ? "remote" : null,
      description: job.description || null,
      skills: job.skills,
      url: job.url,
      source: "Arbeitnow",
      posted_date: job.postedDate,
      status: "saved",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  const { error: matchError } = await computeAndSaveMatch(supabase, user.id, inserted.id);

  await logActivity(supabase, {
    userId: user.id,
    entityType: "job_listing",
    entityId: inserted.id,
    action: "created",
    message: `Saved ${job.title} at ${job.companyName} from live search`,
  });

  revalidatePath("/career/job-search");
  revalidatePath("/career");

  if (matchError) {
    return { success: "Job saved — add your Career Profile to see a match score.", id: inserted.id as string };
  }
  return { success: "Job saved and scored.", id: inserted.id as string };
}
