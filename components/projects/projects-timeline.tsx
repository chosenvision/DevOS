import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types/database";

export function ProjectsTimeline({ projects }: { projects: Project[] }) {
  const withDates = projects
    .filter((p) => p.start_date || p.deadline)
    .sort((a, b) => new Date(a.start_date ?? a.deadline!).getTime() - new Date(b.start_date ?? b.deadline!).getTime());

  const withoutDates = projects.filter((p) => !p.start_date && !p.deadline);

  return (
    <div className="space-y-6">
      <ol className="relative space-y-6 border-l border-border pl-6">
        {withDates.map((project) => (
          <li key={project.id} className="relative">
            <span className="absolute -left-[27px] top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
            <Link href={`/projects/${project.slug}`} className="font-medium hover:underline">
              {project.name}
            </Link>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={PROJECT_STATUS_BADGE[project.status]}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
              {project.start_date && <span>Start {formatDate(project.start_date)}</span>}
              {project.deadline && <span>· Due {formatDate(project.deadline)}</span>}
            </div>
          </li>
        ))}
      </ol>
      {withoutDates.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">No dates set</p>
          <ul className="space-y-1.5">
            {withoutDates.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.slug}`} className="text-sm hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
