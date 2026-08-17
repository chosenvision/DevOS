import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getPortfolioProjects } from "@/services/queries/portfolio";
import { getProjects } from "@/services/queries/projects";
import { PortfolioPageClient } from "./portfolio-page-client";

export const metadata: Metadata = { title: "Portfolio — DevOS" };

export default async function PortfolioPage() {
  const { supabase, user } = await requireUser();

  const [entries, projects, { data: profile }] = await Promise.all([
    getPortfolioProjects(supabase, user.id),
    getProjects(supabase, user.id),
    supabase.from("profiles").select("username").eq("id", user.id).single(),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Choose which projects appear on your public portfolio.</p>
      </div>
      <PortfolioPageClient entries={entries} projects={projects} username={profile?.username ?? null} />
    </div>
  );
}
