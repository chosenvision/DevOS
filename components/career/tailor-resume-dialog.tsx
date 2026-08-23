"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { tailorResumeForJob } from "@/services/actions/resumes";
import type { Resume } from "@/types/database";

export function TailorResumeDialog({
  jobId,
  resumes,
  aiConfigured,
  open,
  onOpenChange,
}: {
  jobId: string;
  resumes: Resume[];
  aiConfigured: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [resumeId, setResumeId] = React.useState(resumes[0]?.id ?? "");
  const [pending, setPending] = React.useState(false);

  async function handleTailor() {
    if (!resumeId) return;
    setPending(true);
    const res = await tailorResumeForJob(resumeId, jobId);
    setPending(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(res.success);
    onOpenChange(false);
    if (res.id) router.push(`/career/resume/${res.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tailor resume for this job</DialogTitle>
          <DialogDescription>
            Reorders and rewords your existing resume to match this job — never invents experience, metrics, or
            skills you don&apos;t already have. Saved as a new version; your original is untouched.
          </DialogDescription>
        </DialogHeader>

        {!aiConfigured ? (
          <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
            This needs an AI provider key. Add <code className="rounded bg-muted px-1 py-0.5">ANTHROPIC_API_KEY</code>{" "}
            — see{" "}
            <Link href="/settings/ai" className="text-primary hover:underline">
              Settings → AI
            </Link>
            .
          </p>
        ) : resumes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any resumes yet.{" "}
            <Link href="/career/resume" className="text-primary hover:underline">
              Create one in Resume Studio
            </Link>{" "}
            first.
          </p>
        ) : (
          <div className="space-y-4">
            <Select value={resumeId} onValueChange={setResumeId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={handleTailor} disabled={pending}>
              <Sparkles className="size-4" />
              {pending ? "Tailoring..." : "Tailor resume"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
