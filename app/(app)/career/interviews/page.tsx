import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Calendar, ExternalLink, FileText } from "lucide-react";

import { requireUser } from "@/services/auth";
import { getInterviewApplications } from "@/services/queries/career";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Interviews — DevOS" };

export default async function InterviewsPage() {
  const { supabase, user } = await requireUser();
  const applications = await getInterviewApplications(supabase, user.id);

  const now = new Date();
  const upcoming = applications.filter((a) => !a.interview_date || new Date(a.interview_date) >= now);
  const past = applications.filter((a) => a.interview_date && new Date(a.interview_date) < now);

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No interviews scheduled."
        description="Move an application to Interview or Final Interview and it'll show up here with a prep workspace."
        actionLabel="Go to Applications"
        href="/career/applications"
        icon={Calendar}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {upcoming.map((app) => (
          <Card key={app.id} className="gap-3 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3 px-5">
              <div>
                <p className="text-sm font-semibold">{app.position}</p>
                <p className="text-xs text-muted-foreground">{app.company_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={app.status === "final_interview" ? "default" : "secondary"}>
                  {APPLICATION_STATUS_LABEL[app.status]}
                </Badge>
                {app.job_url && (
                  <Button size="icon" variant="ghost" className="size-7" asChild>
                    <a href={app.job_url} target="_blank" rel="noopener noreferrer" aria-label="Open job posting">
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" />
                {app.interview_date ? formatDateTime(app.interview_date) : "Date TBD"}
              </span>
              {app.recruiter_name && <span>Contact: {app.recruiter_name}</span>}
            </div>

            {(app.company?.notes || app.company?.culture_notes) && (
              <div className="mx-5 space-y-1 rounded-md bg-muted/40 p-3 text-xs">
                <p className="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <Building2 className="size-3" /> Company notes
                </p>
                {app.company?.culture_notes && <p>{app.company.culture_notes}</p>}
                {app.company?.notes && <p className="text-muted-foreground">{app.company.notes}</p>}
              </div>
            )}

            <div className="flex flex-wrap gap-2 px-5">
              <Button size="sm" variant="outline" asChild>
                <Link href="/career/interview-prep">Interview Prep</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/career/coding-practice">Coding Practice</Link>
              </Button>
              {app.company_id && (
                <Button size="sm" variant="outline" asChild>
                  <Link href="/career/companies">
                    <FileText className="size-3.5" /> Company research
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {past.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Past interviews</h3>
          <Card className="gap-0 divide-y divide-border py-0">
            {past.map((app) => (
              <div key={app.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <span className="font-medium">{app.position}</span>
                  <span className="text-muted-foreground"> at {app.company_name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {app.interview_date ? formatDateTime(app.interview_date) : ""}
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
