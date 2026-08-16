"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/services/auth";
import { logActivity } from "@/services/activity";
import { slugify } from "@/lib/utils";
import { projectSchema } from "@/lib/validations/project";

export type ActionState = { error?: string; success?: string };

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
  name: string
) {
  const base = slugify(name) || "project";
  let slug = base;
  let attempt = 0;

  while (attempt < 25) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }

  return `${base}-${Date.now()}`;
}

export async function createProject(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "idea",
    priority: formData.get("priority") || "medium",
    category: formData.get("category") || undefined,
    isClientProject: formData.get("isClientProject") === "on",
    clientName: formData.get("clientName") || undefined,
    startDate: formData.get("startDate") || undefined,
    deadline: formData.get("deadline") || undefined,
    techStack: formData.get("techStack") || undefined,
    repoUrl: formData.get("repoUrl") || undefined,
    liveUrl: formData.get("liveUrl") || undefined,
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const slug = await uniqueSlug(supabase, user.id, parsed.data.name);
  const techStack = parsed.data.techStack
    ? parsed.data.techStack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      category: parsed.data.category ?? null,
      is_client_project: parsed.data.isClientProject,
      client_name: parsed.data.clientName ?? null,
      start_date: parsed.data.startDate || null,
      deadline: parsed.data.deadline || null,
      tech_stack: techStack,
      repo_url: parsed.data.repoUrl || null,
      live_url: parsed.data.liveUrl || null,
    })
    .select("id, slug")
    .single();

  if (error || !project) {
    return { error: error?.message ?? "Could not create project." };
  }

  await logActivity(supabase, {
    userId: user.id,
    entityType: "project",
    entityId: project.id,
    projectId: project.id,
    action: "created",
    message: `Created project "${parsed.data.name}"`,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${project.slug}`);
}

export async function updateProject(projectId: string, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "idea",
    priority: formData.get("priority") || "medium",
    category: formData.get("category") || undefined,
    isClientProject: formData.get("isClientProject") === "on",
    clientName: formData.get("clientName") || undefined,
    startDate: formData.get("startDate") || undefined,
    deadline: formData.get("deadline") || undefined,
    techStack: formData.get("techStack") || undefined,
    repoUrl: formData.get("repoUrl") || undefined,
    liveUrl: formData.get("liveUrl") || undefined,
    progress: formData.get("progress") || undefined,
    notes: formData.get("notes") || undefined,
    goals: formData.get("goals") || undefined,
  };

  const parsed = projectSchema.extend({}).safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const techStack = parsed.data.techStack
    ? parsed.data.techStack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { data: existing } = await supabase
    .from("projects")
    .select("status, slug")
    .eq("id", projectId)
    .single();

  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      category: parsed.data.category ?? null,
      is_client_project: parsed.data.isClientProject,
      client_name: parsed.data.clientName ?? null,
      start_date: parsed.data.startDate || null,
      deadline: parsed.data.deadline || null,
      tech_stack: techStack,
      repo_url: parsed.data.repoUrl || null,
      live_url: parsed.data.liveUrl || null,
      progress: raw.progress ? Number(raw.progress) : undefined,
      notes: typeof raw.notes === "string" ? raw.notes : undefined,
      goals: typeof raw.goals === "string" ? raw.goals : undefined,
    })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  if (existing && existing.status !== parsed.data.status) {
    await logActivity(supabase, {
      userId: user.id,
      entityType: "project",
      entityId: projectId,
      projectId,
      action: "status_changed",
      message: `Moved "${parsed.data.name}" to ${parsed.data.status.replace("_", " ")}`,
    });
  }

  revalidatePath(`/projects/${existing?.slug}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: "Project updated." };
}

export async function updateProjectStatus(projectId: string, status: string) {
  const { supabase, user } = await requireUser();

  const { data: project } = await supabase
    .from("projects")
    .select("name, slug")
    .eq("id", projectId)
    .single();

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (!error && project) {
    await logActivity(supabase, {
      userId: user.id,
      entityType: "project",
      entityId: projectId,
      projectId,
      action: "status_changed",
      message: `Moved "${project.name}" to ${String(status).replace("_", " ")}`,
    });
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { error: error?.message };
}

export async function archiveProject(projectId: string, archived: boolean) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("projects")
    .update({ is_archived: archived, archived_at: archived ? new Date().toISOString() : null })
    .eq("id", projectId)
    .eq("user_id", user.id);

  revalidatePath("/projects");
  return { error: error?.message };
}

export async function deleteProject(projectId: string) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/projects");
  redirect("/projects");
}
