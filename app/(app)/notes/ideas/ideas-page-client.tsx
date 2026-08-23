"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight, Lightbulb, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { KanbanBoard, type KanbanColumn } from "@/components/shared/kanban-board";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createIdea, updateIdeaStatus, convertIdeaToProject } from "@/services/actions/ideas";
import { runAction } from "@/lib/action-feedback";
import { IDEA_STATUS_LABEL, DIFFICULTY_LABEL } from "@/lib/constants";
import type { Idea, IdeaStatus } from "@/types/database";

const COLUMNS: KanbanColumn[] = (Object.keys(IDEA_STATUS_LABEL) as IdeaStatus[]).map((s) => ({
  id: s,
  label: IDEA_STATUS_LABEL[s],
}));

export function IdeasPageClient({ ideas }: { ideas: Idea[] }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createIdea({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  if (ideas.length === 0) {
    return (
      <>
        <EmptyState title="No ideas captured yet." description="Quickly jot down anything worth building later." actionLabel="Capture idea" onAction={() => setOpen(true)} icon={Lightbulb} />
        <IdeaDialog open={open} onOpenChange={setOpen} formAction={formAction} error={error} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Capture idea
        </Button>
      </div>

      <KanbanBoard
        columns={COLUMNS}
        items={ideas}
        getId={(i) => i.id}
        getColumnId={(i) => i.status}
        onMove={async (id, status) => {
          const res = await updateIdeaStatus(id, status);
          if (res.error) toast.error(res.error);
        }}
        renderCard={(idea) => (
          <Card className="gap-2 py-3 shadow-none">
            <p className="truncate px-3 text-sm font-medium">{idea.title}</p>
            {idea.description && <p className="line-clamp-2 px-3 text-xs text-muted-foreground">{idea.description}</p>}
            <div className="flex flex-wrap items-center gap-1.5 px-3">
              {idea.difficulty && <Badge variant="outline">{DIFFICULTY_LABEL[idea.difficulty]}</Badge>}
              {idea.potential && <Badge variant="secondary">Potential {idea.potential}/5</Badge>}
            </div>
            {!idea.converted_project_id && (
              <button
                className="flex items-center gap-1 px-3 text-xs text-primary hover:underline"
                onClick={() => runAction(() => convertIdeaToProject(idea.id))}
              >
                Convert to project <ArrowRight className="size-3" />
              </button>
            )}
          </Card>
        )}
      />

      <IdeaDialog open={open} onOpenChange={setOpen} formAction={formAction} error={error} />
    </div>
  );
}

function IdeaDialog({
  open,
  onOpenChange,
  formAction,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formAction: (formData: FormData) => void;
  error?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Capture idea</DialogTitle>
          <DialogDescription>A project, feature, or content idea — organize it later.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="idea-title">Idea</Label>
            <Input id="idea-title" name="title" required autoFocus placeholder="A habit tracker with a heatmap" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="idea-desc">Description</Label>
            <Textarea id="idea-desc" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="idea-category">Category</Label>
              <Input id="idea-category" name="category" placeholder="Project idea" />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select name="difficulty">
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="idea-tech">Tech stack</Label>
            <Input id="idea-tech" name="techStack" placeholder="React, Supabase" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Capture idea</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
