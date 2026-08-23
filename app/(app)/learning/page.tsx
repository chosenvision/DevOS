import Link from "next/link";
import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getLearningOverview } from "@/services/queries/learning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Stagger, StaggerItem } from "@/components/shared/motion";
import { COURSE_STATUS_LABEL } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Learning — DevOS" };

export default async function LearningOverviewPage() {
  const { supabase, user } = await requireUser();
  const overview = await getLearningOverview(supabase, user.id);

  return (
    <Stagger className="grid gap-4 lg:grid-cols-3">
      <StaggerItem className="lg:col-span-2">
        <Card className="hover-lift py-4">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Courses in progress</CardTitle>
            <Link href="/learning/courses" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {overview.activeCourses.length === 0 ? (
              <EmptyState title="No courses in progress." description="Add a course you're currently working through." />
            ) : (
              <div className="space-y-4">
                {overview.activeCourses.map((course) => (
                  <div key={course.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{course.name}</span>
                      <Badge variant="secondary">{COURSE_STATUS_LABEL[course.status]}</Badge>
                    </div>
                    <Progress value={course.progress} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="hover-lift py-4">
          <CardHeader>
            <CardTitle className="text-sm">Skill snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Skills tracked</span>
              <span className="font-medium">{overview.skillCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hours practiced</span>
              <span className="font-medium">{overview.hoursPracticedTotal.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Certifications</span>
              <span className="font-medium">{overview.certificationCount}</span>
            </div>
            <Link href="/learning/skills" className="block text-xs text-primary hover:underline">
              View all skills →
            </Link>
          </CardContent>
        </Card>
      </StaggerItem>

      {overview.currentRoadmapStep && (
        <StaggerItem>
          <Card className="hover-lift py-4">
            <CardHeader>
              <CardTitle className="text-sm">Current roadmap step</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{overview.currentRoadmapStep.roadmapTitle}</p>
              <p className="mt-1 font-medium">{overview.currentRoadmapStep.title}</p>
              <Link href="/learning/roadmap" className="mt-2 block text-xs text-primary hover:underline">
                View roadmap →
              </Link>
            </CardContent>
          </Card>
        </StaggerItem>
      )}

      <StaggerItem className="lg:col-span-2">
        <Card className="hover-lift py-4">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Recently saved resources</CardTitle>
            <Link href="/learning/resources" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {overview.recentResources.length === 0 ? (
              <EmptyState title="No resources saved yet." description="Save articles, videos, and docs as you find them." />
            ) : (
              <ul className="divide-y divide-border">
                {overview.recentResources.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="truncate">{r.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatShortDate(r.date_added)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </StaggerItem>
    </Stagger>
  );
}
