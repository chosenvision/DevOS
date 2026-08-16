"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Kanban, GanttChartSquare, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectsList } from "@/components/projects/projects-list";
import { ProjectsKanban } from "@/components/projects/projects-kanban";
import { ProjectsTimeline } from "@/components/projects/projects-timeline";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import type { Project } from "@/types/database";

type ViewMode = "grid" | "list" | "kanban" | "timeline";

const VIEW_ICONS: Record<ViewMode, React.ElementType> = {
  grid: LayoutGrid,
  list: List,
  kanban: Kanban,
  timeline: GanttChartSquare,
};

export function ProjectsPageClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = React.useState<ViewMode>("grid");
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(searchParams.get("new") === "1");

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (projects.length === 0) {
    return (
      <>
        <EmptyState
          title="You haven't created a project yet."
          description="Start building something — track progress, milestones, and bugs in one place."
          actionLabel="Create Project"
          onAction={() => setDialogOpen(true)}
        />
        <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-8"
          />
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
          <TabsList>
            {(Object.keys(VIEW_ICONS) as ViewMode[]).map((v) => {
              const Icon = VIEW_ICONS[v];
              return (
                <TabsTrigger key={v} value={v} className="capitalize">
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{v}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        <Button
          className="ml-auto"
          onClick={() => {
            setDialogOpen(true);
            router.replace("/projects");
          }}
        >
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No projects match &ldquo;{search}&rdquo;.</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : view === "list" ? (
        <ProjectsList projects={filtered} />
      ) : view === "kanban" ? (
        <ProjectsKanban projects={filtered} />
      ) : (
        <ProjectsTimeline projects={filtered} />
      )}

      <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
