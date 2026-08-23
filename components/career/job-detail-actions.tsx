"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, X, Rocket, FileEdit, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteJobListing, recomputeJobMatch, startApplicationFromJob } from "@/services/actions/career";
import { TailorResumeDialog } from "@/components/career/tailor-resume-dialog";
import { CoverLetterDialog } from "@/components/career/cover-letter-dialog";
import type { Resume } from "@/types/database";

export function JobDetailActions({
  jobId,
  applicationId,
  alreadyApplied,
  resumes,
  aiConfigured,
}: {
  jobId: string;
  applicationId?: string | null;
  alreadyApplied: boolean;
  resumes: Resume[];
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [tailorOpen, setTailorOpen] = React.useState(false);
  const [coverLetterOpen, setCoverLetterOpen] = React.useState(false);

  function handleStartApplication() {
    startTransition(async () => {
      const res = await startApplicationFromJob(jobId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res.success ?? "Application started.");
      router.push("/career/applications");
    });
  }

  function handleRecompute() {
    startTransition(async () => {
      const res = await recomputeJobMatch(jobId);
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success ?? "Match recalculated.");
        router.refresh();
      }
    });
  }

  function handleDismiss() {
    startTransition(async () => {
      const res = await deleteJobListing(jobId);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Job removed.");
        router.push("/career/job-search");
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleStartApplication} disabled={pending || alreadyApplied}>
          <Rocket className="size-4" />
          {alreadyApplied ? "Application started" : "Start Application"}
        </Button>
        <Button variant="outline" onClick={() => setTailorOpen(true)}>
          <FileEdit className="size-4" /> Tailor Resume
        </Button>
        <Button variant="outline" onClick={() => setCoverLetterOpen(true)}>
          <Mail className="size-4" /> Cover Letter
        </Button>
        <Button variant="outline" onClick={handleRecompute} disabled={pending}>
          <RefreshCw className="size-4" /> Recompute match
        </Button>
        <Button variant="ghost" onClick={handleDismiss} disabled={pending}>
          <X className="size-4" /> Remove
        </Button>
      </div>

      <TailorResumeDialog jobId={jobId} resumes={resumes} aiConfigured={aiConfigured} open={tailorOpen} onOpenChange={setTailorOpen} />
      <CoverLetterDialog
        jobId={jobId}
        applicationId={applicationId ?? null}
        resumes={resumes}
        aiConfigured={aiConfigured}
        open={coverLetterOpen}
        onOpenChange={setCoverLetterOpen}
      />
    </>
  );
}
