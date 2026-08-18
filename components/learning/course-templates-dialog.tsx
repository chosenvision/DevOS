"use client";

import * as React from "react";
import { toast } from "sonner";
import { ExternalLink, ListChecks, Sparkles } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createCourseFromTemplate } from "@/services/actions/learning";
import { COURSE_TEMPLATES } from "@/lib/templates/course-templates";

export function CourseTemplatesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [pendingId, setPendingId] = React.useState<string>();

  async function handleUse(templateId: string) {
    setPendingId(templateId);
    const res = await createCourseFromTemplate(templateId);
    setPendingId(undefined);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(res.success);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Course templates</DialogTitle>
          <DialogDescription>
            Starter outlines based on well-known free courses, with lessons pre-filled. Representative, not a live
            syllabus — check the course link for what&apos;s actually current, and edit lessons freely after adding.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {COURSE_TEMPLATES.map((t) => (
            <Card key={t.id} className="gap-2 py-4">
              <div className="flex items-start justify-between gap-2 px-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.platform}</p>
                </div>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label={`View ${t.name} course`}
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
              <p className="px-4 text-xs text-muted-foreground">{t.description}</p>
              <div className="flex items-center justify-between px-4">
                <Badge variant="secondary">
                  <ListChecks className="size-3" /> {t.lessons.length} lessons
                </Badge>
                <Button size="sm" variant="outline" disabled={pendingId === t.id} onClick={() => handleUse(t.id)}>
                  <Sparkles className="size-3.5" />
                  {pendingId === t.id ? "Adding..." : "Use template"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
