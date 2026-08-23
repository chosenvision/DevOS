import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, MapPin, DollarSign, Calendar, ExternalLink, Check, AlertTriangle } from "lucide-react";

import { requireUser } from "@/services/auth";
import { getJobListing, getResumes } from "@/services/queries/career";
import { isAiConfigured } from "@/lib/ai/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { JobDetailActions } from "@/components/career/job-detail-actions";
import { formatShortDate } from "@/lib/utils";
import { EMPLOYMENT_TYPE_LABEL, MATCH_RECOMMENDATION_LABEL } from "@/lib/constants";
import type { MatchRecommendation } from "@/types/database";

const MATCH_BADGE_VARIANT: Record<MatchRecommendation, "success" | "default" | "warning" | "destructive"> = {
  excellent_match: "success",
  strong_match: "default",
  possible_match: "warning",
  weak_match: "destructive",
};

const SUB_SCORE_LABEL: Record<string, string> = {
  skills: "Skills Match",
  title: "Role Match",
  location: "Location / Work Setup",
  salary: "Salary Match",
};

export async function generateMetadata({ params }: PageProps<"/career/job-search/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Job — DevOS`, description: id };
}

export default async function JobListingDetailPage({ params }: PageProps<"/career/job-search/[id]">) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const [job, resumes] = await Promise.all([getJobListing(supabase, user.id, id), getResumes(supabase, user.id)]);

  if (!job) notFound();

  return (
    <div className="space-y-6">
      <Link href="/career/job-search" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Job Search
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{job.title}</h1>
          <p className="text-sm text-muted-foreground">{job.company_name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" /> {job.location}
              </span>
            )}
            {(job.salary_min || job.salary_max) && (
              <span className="inline-flex items-center gap-1">
                <DollarSign className="size-3" />
                {job.salary_min && job.salary_max
                  ? `$${job.salary_min.toLocaleString()}–$${job.salary_max.toLocaleString()}`
                  : `$${(job.salary_min ?? job.salary_max)!.toLocaleString()}`}
              </span>
            )}
            {job.posted_date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" /> Posted {formatShortDate(job.posted_date)}
              </span>
            )}
            {job.url && (
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                <ExternalLink className="size-3" /> View posting
              </a>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.work_mode && <Badge variant="secondary">{job.work_mode}</Badge>}
            {job.employment_type && <Badge variant="secondary">{EMPLOYMENT_TYPE_LABEL[job.employment_type]}</Badge>}
            <Badge variant="muted">Source: {job.source}</Badge>
          </div>
        </div>
        {job.match_score != null && job.match_recommendation && (
          <Card className="items-center gap-1 px-6 py-4 text-center">
            <p className="text-3xl font-semibold tabular-nums">{job.match_score}%</p>
            <Badge variant={MATCH_BADGE_VARIANT[job.match_recommendation]}>{MATCH_RECOMMENDATION_LABEL[job.match_recommendation]}</Badge>
          </Card>
        )}
      </div>

      <JobDetailActions
        jobId={job.id}
        applicationId={job.application_id}
        alreadyApplied={job.status === "applied"}
        resumes={resumes}
        aiConfigured={isAiConfigured()}
      />

      {job.match_score != null ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-sm">Match Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(job.match_sub_scores).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{SUB_SCORE_LABEL[key] ?? key}</span>
                    <span className="font-medium tabular-nums">{value}%</span>
                  </div>
                  <Progress value={value as number} />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="text-sm">Why You Match</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {job.match_why.map((w, i) => (
                  <p key={i} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {w}
                  </p>
                ))}
              </CardContent>
            </Card>
            {job.match_missing.length > 0 && (
              <Card className="py-4">
                <CardHeader>
                  <CardTitle className="text-sm">Missing / Weak Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {job.match_missing.map((m, i) => (
                    <p key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" /> {m}
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card className="py-6 text-center">
          <p className="px-5 text-sm text-muted-foreground">
            No match score yet — set up your{" "}
            <Link href="/career/profile" className="text-primary hover:underline">
              Career Profile
            </Link>{" "}
            first, then recompute.
          </p>
        </Card>
      )}

      {job.skills.length > 0 && (
        <Card className="py-4">
          <CardHeader>
            <CardTitle className="text-sm">Skills Requested</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {job.description && (
        <Card className="py-4">
          <CardHeader>
            <CardTitle className="text-sm">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
