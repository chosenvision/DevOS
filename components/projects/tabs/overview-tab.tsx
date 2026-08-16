import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import type { ProjectDetail } from "@/services/queries/projects";

function healthLabel(detail: ProjectDetail): { label: string; variant: "success" | "warning" | "destructive" | "muted" } {
  const { project, tasks } = detail;
  if (project.status === "completed") return { label: "Shipped", variant: "success" };
  if (project.deadline && new Date(project.deadline) < new Date()) {
    return { label: "Overdue", variant: "destructive" };
  }
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  if (blocked > 0) return { label: `${blocked} blocked`, variant: "warning" };
  return { label: "On track", variant: "success" };
}

export function OverviewTab({ detail }: { detail: ProjectDetail }) {
  const { project, tasks, milestones } = detail;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const daysRemaining = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / 86400000)
    : null;
  const health = healthLabel(detail);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="py-4 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm">Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Overall completion</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Health</p>
              <Badge variant={health.variant} className="mt-1">{health.label}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tasks completed</p>
              <p className="font-medium">{completedTasks} / {tasks.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hours logged</p>
              <p className="font-medium">{detail.hoursLogged}h</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Days remaining</p>
              <p className="font-medium">{daysRemaining !== null ? `${daysRemaining}d` : "—"}</p>
            </div>
          </div>
          {project.tech_stack.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Technology stack</p>
              <div className="flex flex-wrap gap-1.5">
                {project.tech_stack.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Started</span>
            <span>{project.start_date ? formatDate(project.start_date) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deadline</span>
            <span>{project.deadline ? formatDate(project.deadline) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Milestones</span>
            <span>{milestones.filter((m) => m.status === "completed").length} / {milestones.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{formatDate(project.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      {(project.notes || project.goals) && (
        <Card className="py-4 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Notes & goals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {project.goals && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Goals</p>
                <p className="text-sm whitespace-pre-wrap">{project.goals}</p>
              </div>
            )}
            {project.notes && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
