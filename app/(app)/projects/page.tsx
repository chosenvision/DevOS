import Link from "next/link";
import type { Metadata } from "next";
import { LayoutTemplate } from "lucide-react";

import { requireUser } from "@/services/auth";
import { getProjects } from "@/services/queries/projects";
import { ProjectsPageClient } from "./projects-page-client";

export const metadata: Metadata = { title: "Projects — DevOS" };

export default async function ProjectsPage() {
  const { supabase, user } = await requireUser();
  const projects = await getProjects(supabase, user.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">Everything you&apos;re building, in one place.</p>
        </div>
        <Link href="/portfolio" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <LayoutTemplate className="size-4" /> Portfolio
        </Link>
      </div>
      <ProjectsPageClient projects={projects} />
    </div>
  );
}
