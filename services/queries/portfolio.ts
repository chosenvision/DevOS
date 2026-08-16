import type { SupabaseClient } from "@supabase/supabase-js";

import type { PortfolioProject, Profile } from "@/types/database";

export async function getPortfolioProjects(supabase: SupabaseClient, userId: string): Promise<PortfolioProject[]> {
  const { data } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  return (data as PortfolioProject[]) ?? [];
}

export async function getPublicPortfolio(
  supabase: SupabaseClient,
  username: string
): Promise<{ profile: Profile; projects: PortfolioProject[] } | null> {
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  if (!profile) return null;

  const { data: projects } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true });

  return { profile: profile as Profile, projects: (projects as PortfolioProject[]) ?? [] };
}
