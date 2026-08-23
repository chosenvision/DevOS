"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { createStarResponse, deleteStarResponse } from "@/services/actions/interview-prep";
import { runAction } from "@/lib/action-feedback";
import type { StarResponse } from "@/types/database";

export function StarBuilder({ responses }: { responses: StarResponse[] }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createStarResponse({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New STAR response
        </Button>
      </div>

      {responses.length === 0 ? (
        <EmptyState
          title="No STAR responses yet."
          description="Structure your best stories: Situation, Task, Action, Result."
          actionLabel="New STAR response"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {responses.map((r) => (
            <Card key={r.id} className="gap-2 py-3">
              <div className="flex items-start justify-between gap-2 px-4">
                <p className="text-sm font-medium">{r.title}</p>
                <Button size="icon" variant="ghost" className="size-6" onClick={() => runAction(() => deleteStarResponse(r.id))} aria-label="Delete STAR response">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <div className="grid gap-2 px-4 text-xs sm:grid-cols-2">
                {r.situation && <p><span className="font-medium text-foreground">Situation: </span><span className="text-muted-foreground">{r.situation}</span></p>}
                {r.task && <p><span className="font-medium text-foreground">Task: </span><span className="text-muted-foreground">{r.task}</span></p>}
                {r.action && <p><span className="font-medium text-foreground">Action: </span><span className="text-muted-foreground">{r.action}</span></p>}
                {r.result && <p><span className="font-medium text-foreground">Result: </span><span className="text-muted-foreground">{r.result}</span></p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New STAR response</DialogTitle>
            <DialogDescription>Structure a story you can reuse in interviews.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="star-title">Title</Label>
              <Input id="star-title" name="title" required autoFocus placeholder="Handling a production outage" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="star-situation">Situation</Label>
              <Textarea id="star-situation" name="situation" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="star-task">Task</Label>
              <Textarea id="star-task" name="task" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="star-action">Action</Label>
              <Textarea id="star-action" name="action" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="star-result">Result</Label>
              <Textarea id="star-result" name="result" rows={2} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <SubmitButton>Save response</SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
