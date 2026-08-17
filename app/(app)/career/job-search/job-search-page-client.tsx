"use client";

import { Radar } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { JobListingCard } from "@/components/career/job-listing-card";
import { JobListingFormDialog } from "@/components/career/job-listing-form-dialog";
import { SavedSearches } from "@/components/career/saved-searches";
import { LiveJobSearch } from "@/components/career/live-job-search";
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
      <LiveJobSearch />

      <p className="text-xs text-muted-foreground">
        Live search currently covers one free source. LinkedIn and most job boards require partner-level API
        access DevOS doesn&apos;t have — you can still add any job you find elsewhere manually below, and it
        gets scored the same way.
      </p>

      <SavedSearches searches={searches} />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Jobs</h3>
        <JobListingFormDialog />
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="No jobs saved yet."
          description="Search live jobs above, or add one manually — DevOS will calculate a match score and break down why."
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
