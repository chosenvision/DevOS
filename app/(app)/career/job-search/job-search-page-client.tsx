"use client";

import * as React from "react";
import { Radar } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { JobListingCard } from "@/components/career/job-listing-card";
import { JobListingFormDialog } from "@/components/career/job-listing-form-dialog";
import { SavedSearches } from "@/components/career/saved-searches";
import type { JobListing, JobSearch } from "@/types/database";

const TABS = [
  { value: "all", label: "All" },
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "dismissed", label: "Dismissed" },
] as const;

export function JobSearchPageClient({ listings, searches }: { listings: JobListing[]; searches: JobSearch[] }) {
  return (
    <div className="space-y-6">
      <Card className="flex-row items-start gap-3 border-warning/30 bg-warning/5 py-4">
        <Radar className="mt-0.5 size-4 shrink-0 text-warning" />
        <div className="px-1 text-sm">
          <p className="font-medium">Automatic job discovery: Connection Required</p>
          <p className="text-xs text-muted-foreground">
            DevOS doesn&apos;t yet pull live listings from LinkedIn or job boards — that needs an API connection
            (see Settings → Integrations). For now, add jobs you&apos;ve found manually below and DevOS will
            score and analyze them against your Career Profile.
          </p>
        </div>
      </Card>

      <SavedSearches searches={searches} />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Jobs</h3>
        <JobListingFormDialog />
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="No jobs saved yet."
          description="Add a job you're considering — DevOS will calculate a match score and break down why."
          icon={Radar}
        />
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((t) => {
            const filtered = t.value === "all" ? listings : listings.filter((j) => j.status === t.value);
            return (
              <TabsContent key={t.value} value={t.value} className="mt-4">
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((job) => (
                      <JobListingCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
