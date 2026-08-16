"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/services/auth";
import { logActivity } from "@/services/activity";
import { slugify } from "@/lib/utils";
import { ideaSchema } from "@/lib/validations/career";

export type ActionState = { error?: string; success?: string };

export async function createIdea(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = ideaSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    potential: formData.get("potential") || undefined,
    difficulty: formData.get("difficulty") || undefined,
    techStack: formData.get("techStack") || undefined,
    status: formData.get("status") || "inbox",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const techStack = parsed.data.techStack
    ? parsed.data.techStack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from("ideas").insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category || null,
    potential: parsed.data.potential || null,
    difficulty: parsed.data.difficulty || null,
    tech_stack: techStack,
    status: parsed.data.status,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notes/ideas");
  return { success: "Idea captured." };
}

export async function updateIdeaStatus(ideaId: string, status: string) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("ideas").update({ status }).eq("id", ideaId).eq("user_id", user.id);

  revalidatePath("/notes/ideas");
  return { error: error?.message };
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], userId: string, name: string) {
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

export async function convertIdeaToProject(ideaId: string) {
  const { supabase, user } = await requireUser();

  const { data: idea } = await supabase.from("ideas").select("*").eq("id", ideaId).single();
  if (!idea) return { error: "Idea not found." };

  const slug = await uniqueSlug(supabase, user.id, idea.title);

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: idea.title,
      slug,
      description: idea.description,
      status: "planning",
      category: idea.category,
      tech_stack: idea.tech_stack ?? [],
    })
    .select("id, slug")
    .single();

  if (error || !project) {
    return { error: error?.message ?? "Could not create project." };
  }

  await supabase.from("ideas").update({ status: "building", converted_project_id: project.id }).eq("id", ideaId);

  await logActivity(supabase, {
    userId: user.id,
    entityType: "project",
    entityId: project.id,
    projectId: project.id,
    action: "created",
    message: `Converted idea "${idea.title}" into a project`,
  });

  revalidatePath("/notes/ideas");
  revalidatePath("/projects");
  redirect(`/projects/${project.slug}`);
}
