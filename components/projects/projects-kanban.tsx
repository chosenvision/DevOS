"use client";

import Link from "next/link";
import { toast } from "sonner";

import { KanbanBoard, type KanbanColumn } from "@/components/shared/kanban-board";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { updateProjectStatus } from "@/services/actions/projects";
import { PRIORITY_BADGE, PRIORITY_LABEL, PROJECT_STATUS_LABEL, PROJECT_STATUS_ORDER } from "@/lib/constants";
import type { Project, ProjectStatus } from "@/types/database";

const COLUMNS: KanbanColumn[] = PROJECT_STATUS_ORDER.map((status) => ({
  id: status,
  label: PROJECT_STATUS_LABEL[status],
}));

export function ProjectsKanban({ projects }: { projects: Project[] }) {
  return (
    <KanbanBoard
      columns={COLUMNS}
      items={projects}
      getId={(p) => p.id}
      getColumnId={(p) => p.status}
      onMove={async (id, status) => {
        const res = await updateProjectStatus(id, status as ProjectStatus);
        if (res.error) toast.error(res.error);
      }}
      renderCard={(project, dragging) => (
        <Link href={dragging ? "#" : `/projects/${project.slug}`}>
          <Card className="gap-2 py-3 shadow-none hover:border-primary/40">
            <div className="px-3">
              <p className="truncate text-sm font-medium">{project.name}</p>
            </div>
            <div className="px-3">
              <Progress value={project.progress} className="h-1" />
            </div>
            <div className="flex items-center justify-between px-3">
              <Badge variant={PRIORITY_BADGE[project.priority]}>{PRIORITY_LABEL[project.priority]}</Badge>
              <span className="text-xs text-muted-foreground">{project.progress}%</span>
            </div>
          </Card>
        </Link>
      )}
    />
  );
}
