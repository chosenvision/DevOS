"use client";

import * as React from "react";
import { useActionState } from "react";

import { createProject, type ActionState } from "@/services/actions/projects";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_ORDER, PRIORITY_LABEL } from "@/lib/constants";

const initialState: ActionState = {};

export function ProjectFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [state, formAction] = useActionState(createProject, initialState);
  const [isClient, setIsClient] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Start tracking a new build from idea to shipped.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Project name</Label>
            <Input id="p-name" name="name" required autoFocus placeholder="AI Expense Tracker" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" name="description" rows={3} placeholder="What is this project about?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue="idea">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select name="priority" defaultValue="medium">
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
              <Label htmlFor="p-start">Start date</Label>
              <Input id="p-start" name="startDate" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-deadline">Deadline</Label>
              <Input id="p-deadline" name="deadline" type="date" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-tech">Tech stack</Label>
            <Input id="p-tech" name="techStack" placeholder="React, Supabase, Tailwind CSS (comma separated)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-repo">Repository URL</Label>
              <Input id="p-repo" name="repoUrl" type="url" placeholder="https://github.com/..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-live">Live demo URL</Label>
              <Input id="p-live" name="liveUrl" type="url" placeholder="https://..." />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="hidden" name="isClientProject" value={isClient ? "on" : "off"} />
            <Switch id="p-client" onCheckedChange={setIsClient} checked={isClient} />
            <Label htmlFor="p-client" className="font-normal">This is a client project</Label>
          </div>
          {isClient && (
            <div className="space-y-1.5">
              <Label htmlFor="p-client-name">Client name</Label>
              <Input id="p-client-name" name="clientName" placeholder="Acme Inc." />
            </div>
          )}
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton>Create project</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
