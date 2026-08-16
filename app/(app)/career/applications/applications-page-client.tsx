"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { MonthCalendar } from "@/components/shared/month-calendar";
import { ApplicationsKanban } from "@/components/career/applications-kanban";
import { ApplicationsTable } from "@/components/career/applications-table";
import { ApplicationsAnalytics } from "@/components/career/applications-analytics";
import { ApplicationFormDialog } from "@/components/career/application-form-dialog";
import type { ApplicationAnalytics } from "@/services/queries/career";
import type { JobApplication } from "@/types/database";

export function ApplicationsPageClient({
  applications,
  analytics,
}: {
  applications: JobApplication[];
  analytics: ApplicationAnalytics;
}) {
  const [open, setOpen] = React.useState(false);

  const calendarItems = applications
    .filter((a) => a.interview_date)
    .map((a) => ({
      id: a.id,
      date: a.interview_date as string,
      render: <span className="w-full truncate rounded bg-primary/10 px-1 text-[11px] text-primary">{a.company_name}</span>,
    }));

  if (applications.length === 0) {
    return (
      <>
        <EmptyState
          title="No applications tracked yet."
          description="Add a role you're applying to and follow it through the pipeline."
          actionLabel="Add Application"
          onAction={() => setOpen(true)}
        />
        <ApplicationFormDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <ApplicationsAnalytics analytics={analytics} />

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add application
        </Button>
      </div>

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="kanban">
            <ApplicationsKanban applications={applications} />
          </TabsContent>
          <TabsContent value="table">
            <ApplicationsTable applications={applications} />
          </TabsContent>
          <TabsContent value="calendar">
            <MonthCalendar items={calendarItems} />
          </TabsContent>
        </div>
      </Tabs>

      <ApplicationFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
