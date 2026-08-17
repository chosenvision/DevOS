"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search, ExternalLink, Check, Radar, Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchLiveJobs, saveLiveJob } from "@/services/actions/job-discovery";
import { truncate } from "@/lib/utils";
import type { LiveJobResult } from "@/lib/job-sources/arbeitnow";

export function LiveJobSearch() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<LiveJobResult[] | null>(null);
  const [error, setError] = React.useState<string>();
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());
  const [pending, startTransition] = React.useTransition();
  const [savingId, setSavingId] = React.useState<string>();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await searchLiveJobs(query);
      setError(res.error);
      setResults(res.jobs);
    });
  }

  async function handleSave(job: LiveJobResult) {
    setSavingId(job.externalId);
    const res = await saveLiveJob(job);
    setSavingId(undefined);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(res.success);
    setSavedIds((s) => new Set(s).add(job.externalId));
  }

  return (
    <Card className="gap-3 py-4">
      <div className="flex items-center justify-between px-5">
        <p className="text-sm font-medium">Search Live Jobs</p>
        <span className="text-[11px] text-muted-foreground">via Arbeitnow — remote & EU-friendly tech roles</span>
      </div>
      <form onSubmit={handleSearch} className="flex gap-2 px-5">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, skill, or keyword — e.g. data analyst, SQL"
            className="pl-8"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {error && (
        <p className="mx-5 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
      )}

      {results && results.length === 0 && !error && (
        <p className="px-5 py-6 text-center text-sm text-muted-foreground">No live results for that search.</p>
      )}

      {results && results.length > 0 && (
        <div className="space-y-2 px-5">
          {results.map((job) => {
            const saved = savedIds.has(job.externalId);
            return (
              <div key={job.externalId} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{job.title}</p>
                    {job.remote && <Badge variant="secondary">Remote</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {job.companyName}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                  {job.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{truncate(job.description, 140)}</p>
                  )}
                  {job.skills.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {job.skills.slice(0, 5).map((s) => (
                        <Badge key={s} variant="muted">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="icon" variant="ghost" asChild aria-label="Open job posting">
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant={saved ? "outline" : "default"}
                    disabled={saved || savingId === job.externalId}
                    onClick={() => handleSave(job)}
                  >
                    {saved ? (
                      <>
                        <Check className="size-3.5" /> Saved
                      </>
                    ) : savingId === job.externalId ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      "Save & Score"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!results && !pending && (
        <p className="flex items-center gap-2 px-5 text-xs text-muted-foreground">
          <Radar className="size-3.5" /> Search to pull real, current listings — saved jobs get scored against your Career Profile immediately.
        </p>
      )}
    </Card>
  );
}
