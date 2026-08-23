import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABEL, PRIORITY_BADGE, PRIORITY_LABEL } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { Project } from "@/types/database";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className="hover-lift h-full gap-3 py-4 hover:border-primary/40 hover:bg-accent/30 hover:shadow-soft-lg">
        <div className="flex items-start justify-between gap-2 px-5">
          <div className="min-w-0">
            <p className="truncate font-medium">{project.name}</p>
            {project.category && <p className="text-xs text-muted-foreground">{project.category}</p>}
          </div>
          <Badge variant={PROJECT_STATUS_BADGE[project.status]}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
        </div>
        {project.description && (
          <p className="line-clamp-2 px-5 text-sm text-muted-foreground">{project.description}</p>
        )}
        <div className="px-5">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} />
        </div>
        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5">
            {project.tech_stack.slice(0, 4).map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
            {project.tech_stack.length > 4 && (
              <Badge variant="muted">+{project.tech_stack.length - 4}</Badge>
            )}
          </div>
        )}
        <div className="flex items-center justify-between px-5 text-xs text-muted-foreground">
          <Badge variant={PRIORITY_BADGE[project.priority]}>{PRIORITY_LABEL[project.priority]}</Badge>
          {project.deadline && <span>Due {formatShortDate(project.deadline)}</span>}
        </div>
      </Card>
    </Link>
  );
}
