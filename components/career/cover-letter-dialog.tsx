"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, FileText, Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { generateCoverLetterForJob, saveCoverLetterToApplication } from "@/services/actions/cover-letter";
import type { Resume } from "@/types/database";

export function CoverLetterDialog({
  jobId,
  applicationId,
  resumes,
  aiConfigured,
  open,
  onOpenChange,
}: {
  jobId: string;
  applicationId: string | null;
  resumes: Resume[];
  aiConfigured: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [resumeId, setResumeId] = React.useState(resumes[0]?.id ?? "");
  const [letter, setLetter] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function handleGenerate() {
    setPending(true);
    const res = await generateCoverLetterForJob(jobId, resumeId || undefined);
    setPending(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setLetter(res.letter ?? "");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(letter);
    toast.success("Copied to clipboard.");
  }

  async function handleSave() {
    if (!applicationId) return;
    setSaving(true);
    const res = await saveCoverLetterToApplication(applicationId, letter);
    setSaving(false);
    if (res.error) toast.error(res.error);
    else toast.success("Saved to your application.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cover letter</DialogTitle>
          <DialogDescription>Drafted from your Career Profile and resume — review and edit before using it.</DialogDescription>
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
        ) : (
          <div className="space-y-4">
            {!letter && (
              <>
                {resumes.length > 0 && (
                  <Select value={resumeId} onValueChange={setResumeId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pull experience from a resume (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button className="w-full" onClick={handleGenerate} disabled={pending}>
                  <Sparkles className="size-4" />
                  {pending ? "Drafting..." : "Generate draft"}
                </Button>
              </>
            )}

            {letter && (
              <>
                <Textarea value={letter} onChange={(e) => setLetter(e.target.value)} rows={12} className="text-sm" />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    <Copy className="size-3.5" /> Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleGenerate} disabled={pending}>
                    <Sparkles className="size-3.5" /> {pending ? "Drafting..." : "Regenerate"}
                  </Button>
                  {applicationId && (
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      <Save className="size-3.5" /> {saving ? "Saving..." : "Save to application"}
                    </Button>
                  )}
                </div>
                {!applicationId && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="size-3.5" /> Start the application from this job to save the letter there.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
