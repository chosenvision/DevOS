"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { logActivity } from "@/services/activity";
import { computeJobMatch } from "@/lib/career-match";
import {
  applicationSchema,
  assessmentSchema,
  careerProfileSchema,
  jobListingSchema,
  jobSearchSchema,
} from "@/lib/validations/career";
import type { CareerProfile } from "@/types/database";

export type ActionState = { error?: string; success?: string };

const splitList = (value: string | undefined) =>
  value ? value.split(",").map((v) => v.trim()).filter(Boolean) : [];

export async function createApplication(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = applicationSchema.safeParse({
    companyName: formData.get("companyName"),
    position: formData.get("position"),
    location: formData.get("location") || undefined,
    workMode: formData.get("workMode") || undefined,
    jobUrl: formData.get("jobUrl") || undefined,
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    status: formData.get("status") || "saved",
    dateApplied: formData.get("dateApplied") || undefined,
    source: formData.get("source") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("job_applications").insert({
    user_id: user.id,
    company_name: parsed.data.companyName,
    position: parsed.data.position,
    location: parsed.data.location || null,
    work_mode: parsed.data.workMode || null,
    job_url: parsed.data.jobUrl || null,
    salary_min: parsed.data.salaryMin || null,
    salary_max: parsed.data.salaryMax || null,
    status: parsed.data.status,
    date_applied: parsed.data.dateApplied || null,
    source: parsed.data.source || null,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: error.message };
  }

  await logActivity(supabase, {
    userId: user.id,
    entityType: "application",
    action: "created",
    message: `Applied to ${parsed.data.position} at ${parsed.data.companyName}`,
  });

  revalidatePath("/career/applications");
  revalidatePath("/dashboard");
  return { success: "Application added." };
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const { supabase, user } = await requireUser();

  const { data: app } = await supabase
    .from("job_applications")
    .select("company_name, position")
    .eq("id", applicationId)
    .single();

  const { error } = await supabase
    .from("job_applications")
    .update({ status })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (!error && app) {
    await logActivity(supabase, {
      userId: user.id,
      entityType: "application",
      entityId: applicationId,
      action: "status_changed",
      message: `${app.position} at ${app.company_name} moved to ${String(status).replace("_", " ")}`,
    });
  }

  revalidatePath("/career/applications");
  revalidatePath("/dashboard");
  return { error: error?.message };
}

export async function deleteApplication(applicationId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("job_applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", user.id);

  revalidatePath("/career/applications");
  return { error: error?.message };
}

// -- Career Profile --------------------------------------------------------

export async function upsertCareerProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = careerProfileSchema.safeParse({
    professionalSummary: formData.get("professionalSummary") || undefined,
    yearsExperience: formData.get("yearsExperience") || undefined,
    skills: formData.get("skills") || undefined,
    preferredRoles: formData.get("preferredRoles") || undefined,
    preferredIndustries: formData.get("preferredIndustries") || undefined,
    preferredLocations: formData.get("preferredLocations") || undefined,
    excludedCompanies: formData.get("excludedCompanies") || undefined,
    excludedKeywords: formData.get("excludedKeywords") || undefined,
    remoteOk: formData.get("remoteOk") === "on",
    hybridOk: formData.get("hybridOk") === "on",
    onsiteOk: formData.get("onsiteOk") === "on",
    employmentTypes: formData.getAll("employmentTypes"),
    minSalary: formData.get("minSalary") || undefined,
    targetSalary: formData.get("targetSalary") || undefined,
    noticePeriod: formData.get("noticePeriod") || undefined,
    workAuthorization: formData.get("workAuthorization") || undefined,
    primaryResumeId: formData.get("primaryResumeId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("career_profiles").upsert({
    user_id: user.id,
    professional_summary: parsed.data.professionalSummary || null,
    years_experience: parsed.data.yearsExperience || null,
    skills: splitList(parsed.data.skills),
    preferred_roles: splitList(parsed.data.preferredRoles),
    preferred_industries: splitList(parsed.data.preferredIndustries),
    preferred_locations: splitList(parsed.data.preferredLocations),
    excluded_companies: splitList(parsed.data.excludedCompanies),
    excluded_keywords: splitList(parsed.data.excludedKeywords),
    remote_ok: parsed.data.remoteOk,
    hybrid_ok: parsed.data.hybridOk,
    onsite_ok: parsed.data.onsiteOk,
    employment_types: parsed.data.employmentTypes,
    min_salary: parsed.data.minSalary || null,
    target_salary: parsed.data.targetSalary || null,
    notice_period: parsed.data.noticePeriod || null,
    work_authorization: parsed.data.workAuthorization || null,
    primary_resume_id: parsed.data.primaryResumeId || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/career/profile");
  revalidatePath("/career");
  revalidatePath("/career/job-search");
  return { success: "Career profile saved." };
}

// -- Job Search / Saved Searches -------------------------------------------

export async function createJobSearch(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = jobSearchSchema.safeParse({
    name: formData.get("name"),
    titles: formData.get("titles") || undefined,
    keywords: formData.get("keywords") || undefined,
    locations: formData.get("locations") || undefined,
    remoteOk: formData.get("remoteOk") === "on",
    hybridOk: formData.get("hybridOk") === "on",
    onsiteOk: formData.get("onsiteOk") === "on",
    employmentTypes: formData.getAll("employmentTypes"),
    minSalary: formData.get("minSalary") || undefined,
    notifyOnMatch: formData.get("notifyOnMatch") === "on",
    matchThreshold: formData.get("matchThreshold") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("job_searches").insert({
    user_id: user.id,
    name: parsed.data.name,
    titles: splitList(parsed.data.titles),
    keywords: splitList(parsed.data.keywords),
    locations: splitList(parsed.data.locations),
    remote_ok: parsed.data.remoteOk,
    hybrid_ok: parsed.data.hybridOk,
    onsite_ok: parsed.data.onsiteOk,
    employment_types: parsed.data.employmentTypes,
    min_salary: parsed.data.minSalary || null,
    notify_on_match: parsed.data.notifyOnMatch,
    match_threshold: parsed.data.matchThreshold,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/career/job-search");
  return { success: "Saved search created." };
}

export async function toggleJobSearchActive(jobSearchId: string, isActive: boolean) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("job_searches")
    .update({ is_active: isActive })
    .eq("id", jobSearchId)
    .eq("user_id", user.id);
  revalidatePath("/career/job-search");
  return { error: error?.message };
}

export async function toggleJobSearchNotify(jobSearchId: string, notifyOnMatch: boolean) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("job_searches")
    .update({ notify_on_match: notifyOnMatch })
    .eq("id", jobSearchId)
    .eq("user_id", user.id);
  revalidatePath("/career/job-search");
  return { error: error?.message };
}

export async function deleteJobSearch(jobSearchId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("job_searches").delete().eq("id", jobSearchId).eq("user_id", user.id);
  revalidatePath("/career/job-search");
  return { error: error?.message };
}

// -- Job Listings + Match Engine --------------------------------------------

export async function computeAndSaveMatch(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
  listingId: string
): Promise<{ error?: string }> {
  const [{ data: profile }, { data: listing }] = await Promise.all([
    supabase.from("career_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("job_listings").select("*").eq("id", listingId).eq("user_id", userId).maybeSingle(),
  ]);

  if (!profile) return { error: "Set up your Career Profile first — it's what jobs get matched against." };
  if (!listing) return { error: "Job not found." };

  const result = computeJobMatch(profile as CareerProfile, listing);

  const { error } = await supabase
    .from("job_listings")
    .update({
      match_score: result.score,
      match_recommendation: result.recommendation,
      match_why: result.why,
      match_missing: result.missing,
      match_sub_scores: result.subScores,
      match_computed_at: new Date().toISOString(),
    })
    .eq("id", listingId)
    .eq("user_id", userId);

  return { error: error?.message };
}

export async function createJobListing(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = jobListingSchema.safeParse({
    title: formData.get("title"),
    companyName: formData.get("companyName"),
    location: formData.get("location") || undefined,
    workMode: formData.get("workMode") || undefined,
    employmentType: formData.get("employmentType") || undefined,
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    description: formData.get("description") || undefined,
    skills: formData.get("skills") || undefined,
    url: formData.get("url") || undefined,
    source: formData.get("source") || undefined,
    postedDate: formData.get("postedDate") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { data: inserted, error } = await supabase
    .from("job_listings")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      company_name: parsed.data.companyName,
      location: parsed.data.location || null,
      work_mode: parsed.data.workMode || null,
      employment_type: parsed.data.employmentType || null,
      salary_min: parsed.data.salaryMin || null,
      salary_max: parsed.data.salaryMax || null,
      description: parsed.data.description || null,
      skills: splitList(parsed.data.skills),
      url: parsed.data.url || null,
      source: parsed.data.source || "manual",
      posted_date: parsed.data.postedDate || null,
      status: "saved",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await computeAndSaveMatch(supabase, user.id, inserted.id);

  await logActivity(supabase, {
    userId: user.id,
    entityType: "job_listing",
    entityId: inserted.id,
    action: "created",
    message: `Saved ${parsed.data.title} at ${parsed.data.companyName}`,
  });

  revalidatePath("/career/job-search");
  revalidatePath("/career");
  return { success: "Job saved." };
}

export async function recomputeJobMatch(jobListingId: string): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const { error } = await computeAndSaveMatch(supabase, user.id, jobListingId);
  if (error) return { error };
  revalidatePath("/career/job-search");
  revalidatePath(`/career/job-search/${jobListingId}`);
  return { success: "Match recalculated." };
}

export async function updateJobListingStatus(jobListingId: string, status: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("job_listings")
    .update({ status })
    .eq("id", jobListingId)
    .eq("user_id", user.id);
  revalidatePath("/career/job-search");
  return { error: error?.message };
}

export async function deleteJobListing(jobListingId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("job_listings").delete().eq("id", jobListingId).eq("user_id", user.id);
  revalidatePath("/career/job-search");
  return { error: error?.message };
}

/**
 * Turns a matched job into a tracked application: creates the
 * job_applications record pre-filled from the listing + the profile's
 * primary resume, and links the two records. Does not submit anything
 * externally — the user still applies on the company's site (or wherever
 * `url` points) and moves the application forward themselves.
 */
export async function startApplicationFromJob(jobListingId: string): Promise<ActionState & { applicationId?: string }> {
  const { supabase, user } = await requireUser();

  const { data: listing } = await supabase
    .from("job_listings")
    .select("*")
    .eq("id", jobListingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!listing) {
    return { error: "Job not found." };
  }

  const { data: profile } = await supabase
    .from("career_profiles")
    .select("primary_resume_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: application, error } = await supabase
    .from("job_applications")
    .insert({
      user_id: user.id,
      company_id: listing.company_id,
      company_name: listing.company_name,
      position: listing.title,
      location: listing.location,
      work_mode: listing.work_mode,
      job_url: listing.url,
      salary_min: listing.salary_min,
      salary_max: listing.salary_max,
      source: listing.source,
      status: "preparing",
      resume_id: profile?.primary_resume_id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase
    .from("job_listings")
    .update({ status: "applied", application_id: application.id })
    .eq("id", jobListingId)
    .eq("user_id", user.id);

  await logActivity(supabase, {
    userId: user.id,
    entityType: "application",
    entityId: application.id,
    action: "created",
    message: `Started application for ${listing.title} at ${listing.company_name}`,
  });

  revalidatePath("/career/applications");
  revalidatePath("/career/job-search");
  revalidatePath("/career");
  return { success: "Application started.", applicationId: application.id as string };
}

// -- Assessments -------------------------------------------------------------

export async function createAssessment(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = assessmentSchema.safeParse({
    companyName: formData.get("companyName"),
    role: formData.get("role") || undefined,
    assessmentType: formData.get("assessmentType") || "other",
    platform: formData.get("platform") || undefined,
    url: formData.get("url") || undefined,
    deadline: formData.get("deadline") || undefined,
    status: formData.get("status") || "not_started",
    score: formData.get("score") || undefined,
    notes: formData.get("notes") || undefined,
    applicationId: formData.get("applicationId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Assessments give a real deadline to track — automatically create a
  // linked Task so it also shows up in Tasks/Today, per the spec's
  // "assessments create tasks" integration requirement.
  let taskId: string | null = null;
  if (parsed.data.deadline) {
    const { data: task } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: `Complete ${parsed.data.companyName} assessment`,
        category: "career",
        tags: ["assessment"],
        due_date: new Date(parsed.data.deadline).toISOString(),
        priority: "high",
      })
      .select("id")
      .single();
    taskId = task?.id ?? null;
  }

  const { error } = await supabase.from("assessments").insert({
    user_id: user.id,
    company_name: parsed.data.companyName,
    role: parsed.data.role || null,
    assessment_type: parsed.data.assessmentType,
    platform: parsed.data.platform || null,
    url: parsed.data.url || null,
    deadline: parsed.data.deadline ? new Date(parsed.data.deadline).toISOString() : null,
    status: parsed.data.status,
    score: parsed.data.score || null,
    notes: parsed.data.notes || null,
    application_id: parsed.data.applicationId || null,
    task_id: taskId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/career/assessments");
  revalidatePath("/career");
  revalidatePath("/tasks");
  return { success: "Assessment added." };
}

export async function updateAssessmentStatus(assessmentId: string, status: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("assessments")
    .update({ status })
    .eq("id", assessmentId)
    .eq("user_id", user.id);
  revalidatePath("/career/assessments");
  return { error: error?.message };
}

export async function deleteAssessment(assessmentId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("assessments").delete().eq("id", assessmentId).eq("user_id", user.id);
  revalidatePath("/career/assessments");
  return { error: error?.message };
}
