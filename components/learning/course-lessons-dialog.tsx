"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCourseLesson, toggleCourseLesson, deleteCourseLesson } from "@/services/actions/learning";
import { runAction } from "@/lib/action-feedback";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/database";

export function CourseLessonsDialog({
  course,
  open,
  onOpenChange,
}: {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [newLesson, setNewLesson] = React.useState("");
  const lessons = course.lessons ?? [];

  function handleAdd() {
    const title = newLesson.trim();
    if (!title) return;
    runAction(() => createCourseLesson(course.id, title));
    setNewLesson("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{course.name} — Lessons</DialogTitle>
          <DialogDescription>Checking lessons off updates the course&apos;s overall progress automatically.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {lessons.length > 0 && (
            <ul className="max-h-72 space-y-1.5 overflow-y-auto">
              {lessons.map((l) => (
                <li key={l.id} className="group flex items-center gap-2">
                  <Checkbox
                    checked={l.is_completed}
                    onCheckedChange={(checked) => runAction(() => toggleCourseLesson(l.id, course.id, checked === true))}
                  />
                  <span className={cn("flex-1 text-sm", l.is_completed && "text-muted-foreground line-through")}>
                    {l.title}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-6 opacity-0 group-hover:opacity-100"
                    onClick={() => runAction(() => deleteCourseLesson(l.id, course.id))}
                    aria-label="Delete lesson"
                  >
                    <X className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              value={newLesson}
              onChange={(e) => setNewLesson(e.target.value)}
              placeholder="Add a lesson"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button type="button" size="icon" variant="outline" onClick={handleAdd} aria-label="Add lesson">
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
