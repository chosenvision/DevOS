import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getProjects } from "@/services/queries/projects";
import { ProjectsPageClient } from "./projects-page-client";

export const metadata: Metadata = { title: "Projects — DevOS" };

export default async function ProjectsPage() {
  const { supabase, user } = await requireUser();
  const projects = await getProjects(supabase, user.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">Everything you&apos;re building, in one place.</p>
      </div>
      <ProjectsPageClient projects={projects} />
    </div>
  );
}
