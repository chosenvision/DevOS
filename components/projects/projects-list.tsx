import Link from "next/link";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABEL, PRIORITY_BADGE, PRIORITY_LABEL } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { Project } from "@/types/database";

export function ProjectsList({ projects }: { projects: Project[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Tech</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id} className="cursor-pointer">
            <TableCell>
              <Link href={`/projects/${project.slug}`} className="font-medium hover:underline">
                {project.name}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={PROJECT_STATUS_BADGE[project.status]}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={PRIORITY_BADGE[project.priority]}>{PRIORITY_LABEL[project.priority]}</Badge>
            </TableCell>
            <TableCell className="w-32">
              <div className="flex items-center gap-2">
                <Progress value={project.progress} className="w-16" />
                <span className="text-xs text-muted-foreground">{project.progress}%</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {project.deadline ? formatShortDate(project.deadline) : "—"}
            </TableCell>
            <TableCell className="max-w-48 truncate text-muted-foreground">
              {project.tech_stack.join(", ") || "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
