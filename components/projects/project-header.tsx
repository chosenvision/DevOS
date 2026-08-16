"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, GitBranch, Globe, MoreHorizontal, Archive, Trash2, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABEL, PRIORITY_BADGE, PRIORITY_LABEL } from "@/lib/constants";
import { archiveProject, deleteProject } from "@/services/actions/projects";
import type { Project } from "@/types/database";

export function ProjectHeader({ project }: { project: Project }) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
          <Badge variant={PROJECT_STATUS_BADGE[project.status]}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
          <Badge variant={PRIORITY_BADGE[project.priority]}>{PRIORITY_LABEL[project.priority]}</Badge>
          {project.is_client_project && <Badge variant="outline">Client project</Badge>}
        </div>
        {project.description && <p className="max-w-2xl text-sm text-muted-foreground">{project.description}</p>}
        <div className="flex flex-wrap gap-4">
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <GitBranch className="size-3.5" /> Repository <ArrowUpRight className="size-3" />
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Globe className="size-3.5" /> Live demo <ArrowUpRight className="size-3" />
            </a>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Project actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={async () => {
              const res = await archiveProject(project.id, !project.is_archived);
              if (res.error) toast.error(res.error);
              else {
                toast.success(project.is_archived ? "Project restored." : "Project archived.");
                router.push("/projects");
              }
            }}
          >
            {project.is_archived ? <ArchiveRestore /> : <Archive />}
            {project.is_archived ? "Restore" : "Archive"}
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &ldquo;{project.name}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes the project along with its tasks, milestones, bugs, and notes. This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteProject(project.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
