"use client";

import * as React from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProject } from "@/services/actions/projects";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_ORDER, PRIORITY_LABEL } from "@/lib/constants";
import type { Project } from "@/types/database";

export function SettingsTab({ project }: { project: Project }) {
  const [pending, startTransition] = React.useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const res = await updateProject(project.id, formData);
          if (res.error) toast.error(res.error);
          else toast.success("Project updated.");
        });
      }}
      className="max-w-2xl space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="s-name">Project name</Label>
        <Input id="s-name" name="name" defaultValue={project.name} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="s-desc">Description</Label>
        <Textarea id="s-desc" name="description" defaultValue={project.description ?? ""} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select name="status" defaultValue={project.status}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROJECT_STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</SelectItem>
              ))}
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select name="priority" defaultValue={project.priority}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="s-start">Start date</Label>
          <Input id="s-start" name="startDate" type="date" defaultValue={project.start_date ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-deadline">Deadline</Label>
          <Input id="s-deadline" name="deadline" type="date" defaultValue={project.deadline ?? ""} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="s-progress">Progress ({"%"})</Label>
        <Input id="s-progress" name="progress" type="number" min={0} max={100} defaultValue={project.progress} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="s-tech">Tech stack</Label>
        <Input id="s-tech" name="techStack" defaultValue={project.tech_stack.join(", ")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="s-repo">Repository URL</Label>
          <Input id="s-repo" name="repoUrl" type="url" defaultValue={project.repo_url ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-live">Live demo URL</Label>
          <Input id="s-live" name="liveUrl" type="url" defaultValue={project.live_url ?? ""} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="s-goals">Goals</Label>
        <Textarea id="s-goals" name="goals" defaultValue={project.goals ?? ""} rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="s-notes">Notes</Label>
        <Textarea id="s-notes" name="notes" defaultValue={project.notes ?? ""} rows={3} />
      </div>
      <input type="hidden" name="isClientProject" value={project.is_client_project ? "on" : "off"} />
      <input type="hidden" name="clientName" value={project.client_name ?? ""} />
      <Button type="submit" disabled={pending}>Save changes</Button>
    </form>
  );
}
