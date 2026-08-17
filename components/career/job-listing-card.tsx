import Link from "next/link";
import { MapPin, DollarSign, Calendar, ExternalLink, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/utils";
import { EMPLOYMENT_TYPE_LABEL, MATCH_RECOMMENDATION_LABEL } from "@/lib/constants";
import type { JobListing, MatchRecommendation } from "@/types/database";

const MATCH_BADGE_VARIANT: Record<MatchRecommendation, "success" | "default" | "warning" | "destructive"> = {
  excellent_match: "success",
  strong_match: "default",
  possible_match: "warning",
  weak_match: "destructive",
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  return fmt((min ?? max) as number);
}

export function JobListingCard({ job }: { job: JobListing }) {
  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <Card className="gap-3 py-4">
      <div className="flex items-start justify-between gap-2 px-5">
        <div className="min-w-0">
          <Link href={`/career/job-search/${job.id}`} className="truncate text-sm font-semibold hover:underline">
            {job.title}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{job.company_name}</p>
        </div>
        {job.match_score != null && job.match_recommendation && (
          <Badge variant={MATCH_BADGE_VARIANT[job.match_recommendation]} className="shrink-0">
            <Sparkles className="size-3" />
            {job.match_score}%
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 text-xs text-muted-foreground">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" /> {job.location}
          </span>
        )}
        {salary && (
          <span className="inline-flex items-center gap-1">
            <DollarSign className="size-3" /> {salary}
          </span>
        )}
        {job.posted_date && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" /> {formatShortDate(job.posted_date)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-5">
        {job.work_mode && <Badge variant="secondary">{job.work_mode}</Badge>}
        {job.employment_type && <Badge variant="secondary">{EMPLOYMENT_TYPE_LABEL[job.employment_type]}</Badge>}
        {job.match_recommendation && (
          <span className="text-[11px] text-muted-foreground">{MATCH_RECOMMENDATION_LABEL[job.match_recommendation]}</span>
        )}
      </div>

      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 px-5">
          {job.skills.slice(0, 5).map((s) => (
            <Badge key={s} variant="muted">
              {s}
            </Badge>
          ))}
          {job.skills.length > 5 && <span className="text-[11px] text-muted-foreground">+{job.skills.length - 5} more</span>}
        </div>
      )}

      <div className="flex items-center gap-2 px-5">
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <Link href={`/career/job-search/${job.id}`}>Analyze</Link>
        </Button>
        {job.url && (
          <Button size="icon" variant="ghost" asChild aria-label="Open job posting">
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}
