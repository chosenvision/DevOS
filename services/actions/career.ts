"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { logActivity } from "@/services/activity";
import { applicationSchema } from "@/lib/validations/career";

export type ActionState = { error?: string; success?: string };

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
