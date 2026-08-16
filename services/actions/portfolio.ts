"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";

export type ActionState = { error?: string; success?: string };

export async function addProjectToPortfolio(projectId: string) {
  const { supabase, user } = await requireUser();

  const { data: project } = await supabase.from("projects").select("*").eq("id", projectId).single();
  if (!project) return { error: "Project not found." };

  const { count } = await supabase.from("portfolio_projects").select("id", { count: "exact", head: true }).eq("user_id", user.id);

  const { error } = await supabase.from("portfolio_projects").insert({
    user_id: user.id,
    project_id: project.id,
    title: project.name,
    description: project.description,
    tech_stack: project.tech_stack,
    github_url: project.repo_url,
    live_url: project.live_url,
    sort_order: count ?? 0,
  });

  revalidatePath("/portfolio");
  return { error: error?.message };
}

export async function updatePortfolioEntry(
  entryId: string,
  fields: Partial<{
    title: string;
    role: string;
    problem: string;
    solution: string;
    outcome: string;
    is_published: boolean;
    is_featured: boolean;
  }>
) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("portfolio_projects").update(fields).eq("id", entryId).eq("user_id", user.id);

  revalidatePath("/portfolio");
  return { error: error?.message };
}

export async function reorderPortfolioEntry(entryId: string, direction: "up" | "down") {
  const { supabase, user } = await requireUser();

  const { data: entries } = await supabase
    .from("portfolio_projects")
    .select("id, sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  if (!entries) return { error: "Not found." };

  const index = entries.findIndex((e) => e.id === entryId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= entries.length) return {};

  await supabase.from("portfolio_projects").update({ sort_order: entries[swapIndex].sort_order }).eq("id", entries[index].id);
  await supabase.from("portfolio_projects").update({ sort_order: entries[index].sort_order }).eq("id", entries[swapIndex].id);

  revalidatePath("/portfolio");
  return {};
}

export async function removeFromPortfolio(entryId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", entryId).eq("user_id", user.id);
  revalidatePath("/portfolio");
  return { error: error?.message };
}
