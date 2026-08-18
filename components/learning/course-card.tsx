"use client";

import * as React from "react";
import { toast } from "sonner";
import { ExternalLink, ListChecks, Minus, Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CourseLessonsDialog } from "@/components/learning/course-lessons-dialog";
import { updateCourseProgress } from "@/services/actions/learning";
import { COURSE_STATUS_LABEL } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { Course } from "@/types/database";

export function CourseCard({ course }: { course: Course }) {
  const [lessonsOpen, setLessonsOpen] = React.useState(false);
  const hasLessons = (course.lessons?.length ?? 0) > 0;

  async function adjust(delta: number) {
    const next = Math.max(0, Math.min(100, course.progress + delta));
    const res = await updateCourseProgress(course.id, next);
    if (res.error) toast.error(res.error);
  }

  return (
    <Card className="gap-2 py-4">
      <div className="flex items-start justify-between gap-2 px-5">
        <div className="min-w-0">
          <p className="truncate font-medium">{course.name}</p>
          <p className="text-xs text-muted-foreground">
            {course.platform}
            {course.instructor ? ` · ${course.instructor}` : ""}
          </p>
        </div>
        <Badge variant={course.status === "completed" ? "success" : "secondary"}>
          {COURSE_STATUS_LABEL[course.status]}
        </Badge>
      </div>
      <div className="space-y-1.5 px-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{course.progress}%</span>
        </div>
        <Progress value={course.progress} />
      </div>
      <div className="flex items-center justify-between px-5">
        <div className="flex items-center gap-1">
          {hasLessons ? (
            <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-xs" onClick={() => setLessonsOpen(true)}>
              <ListChecks className="size-3" />
              {course.completed_lessons}/{course.lessons!.length}
            </Button>
          ) : (
            <>
              <Button size="icon" variant="outline" className="size-6" onClick={() => adjust(-10)} aria-label="Decrease progress">
                <Minus className="size-3" />
              </Button>
              <Button size="icon" variant="outline" className="size-6" onClick={() => adjust(10)} aria-label="Increase progress">
                <Plus className="size-3" />
              </Button>
              <Button size="icon" variant="ghost" className="size-6" onClick={() => setLessonsOpen(true)} aria-label="Manage lessons">
                <ListChecks className="size-3" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {course.target_completion_date && <span>Due {formatShortDate(course.target_completion_date)}</span>}
          {course.url && (
            <a href={course.url} target="_blank" rel="noreferrer" className="hover:text-foreground">
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>
      <CourseLessonsDialog course={course} open={lessonsOpen} onOpenChange={setLessonsOpen} />
    </Card>
  );
}
