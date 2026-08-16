"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { CourseCard } from "@/components/learning/course-card";
import { CourseFormDialog } from "@/components/learning/course-form-dialog";
import type { Course } from "@/types/database";

export function CoursesPageClient({ courses }: { courses: Course[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add course
        </Button>
      </div>
      {courses.length === 0 ? (
        <EmptyState
          title="You haven't added a course yet."
          description="Track anything you're learning — Udemy, YouTube, docs, university."
          actionLabel="Add course"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
      <CourseFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
