import Link from "next/link";
import { ArrowUpRight, GitBranch, Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/utils";
import type { CurrentProjectData } from "@/services/queries/dashboard";

export function CurrentProjectCard({ data }: { data: CurrentProjectData | null }) {
  if (!data) {
    return (
      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Current Project</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">
            You haven&apos;t started a project yet. Start building something.
          </p>
          <div className="flex justify-center">
            <Button size="sm" asChild>
              <Link href="/projects?new=1">Create Project</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { project, tasksRemaining, tasksTotal, currentMilestone } = data;
  const daysRemaining = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <Card className="py-4">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">Current Project</CardTitle>
          <p className="mt-1 text-lg font-semibold">{project.name}</p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/projects/${project.slug}`}>
            Open <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {currentMilestone && (
            <div>
              <p className="text-xs text-muted-foreground">Current milestone</p>
              <p className="truncate font-medium">{currentMilestone.title}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Tasks remaining</p>
            <p className="font-medium">
              {tasksRemaining} / {tasksTotal}
            </p>
          </div>
          {daysRemaining !== null && (
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="font-medium">
                {daysRemaining >= 0 ? `${daysRemaining}d left` : "Overdue"} · {formatShortDate(project.deadline)}
              </p>
            </div>
          )}
        </div>

        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.slice(0, 6).map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <GitBranch className="size-3.5" /> Repository
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Globe className="size-3.5" /> Live demo
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
