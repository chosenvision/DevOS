"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, FileText, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { createResume, duplicateResume, deleteResume } from "@/services/actions/resumes";
import { runAction } from "@/lib/action-feedback";
import { formatShortDate } from "@/lib/utils";
import type { Resume } from "@/types/database";

export function ResumesPageClient({ resumes }: { resumes: Resume[] }) {
  const [open, setOpen] = React.useState(false);

  if (resumes.length === 0) {
    return (
      <>
        <EmptyState
          title="No resumes yet."
          description="Create a resume and pull in your projects, skills, and certifications automatically."
          actionLabel="New resume"
          onAction={() => setOpen(true)}
          icon={FileText}
        />
        <NewResumeDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New resume
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {resumes.map((r) => (
          <Card key={r.id} className="gap-2 py-4">
            <div className="flex items-start justify-between gap-2 px-5">
              <div>
                <Link href={`/career/resume/${r.id}`} className="font-medium hover:underline">
                  {r.name}
                </Link>
                {r.target_job && <p className="text-xs text-muted-foreground">For: {r.target_job}</p>}
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  onClick={async () => {
                    const res = await duplicateResume(r.id);
                    if (res.error) toast.error(res.error);
                    else toast.success("Resume duplicated.");
                  }}
                  aria-label="Duplicate resume"
                >
                  <Copy className="size-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="size-7" onClick={() => runAction(() => deleteResume(r.id))} aria-label="Delete resume">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 px-5">
              {r.is_ats_mode && <Badge variant="secondary">ATS-friendly</Badge>}
              {r.is_portfolio_mode && <Badge variant="secondary">Portfolio</Badge>}
              <span className="text-xs text-muted-foreground">Updated {formatShortDate(r.updated_at)}</span>
            </div>
          </Card>
        ))}
      </div>
      <NewResumeDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function NewResumeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New resume</DialogTitle>
          <DialogDescription>Give it a name — you can target it at a specific role.</DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await createResume(formData);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="res-name">Resume name</Label>
            <Input id="res-name" name="name" required autoFocus placeholder="Frontend Engineer Resume" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-target">Target job (optional)</Label>
            <Input id="res-target" name="targetJob" placeholder="Frontend Engineer" />
          </div>
          <Button type="submit" className="w-full">Create resume</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
