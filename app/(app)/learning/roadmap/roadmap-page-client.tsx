"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { RoadmapChain } from "@/components/learning/roadmap-chain";
import { createRoadmap } from "@/services/actions/learning";
import type { RoadmapWithSteps } from "@/services/queries/learning";

export function RoadmapPageClient({ roadmaps }: { roadmaps: RoadmapWithSteps[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New roadmap
        </Button>
      </div>

      {roadmaps.length === 0 ? (
        <EmptyState
          title="No learning roadmap yet."
          description="Map out the path to a goal, e.g. Frontend Developer: HTML → CSS → JavaScript → React → TypeScript."
          actionLabel="New roadmap"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {roadmaps.map((r) => (
            <RoadmapChain key={r.id} roadmap={r} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New roadmap</DialogTitle>
            <DialogDescription>Give it a goal — you&apos;ll add steps next.</DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              const res = await createRoadmap(formData);
              if (res.error) toast.error(res.error);
              else setOpen(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="rm-title">Title</Label>
              <Input id="rm-title" name="title" required autoFocus placeholder="Frontend Developer Roadmap" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rm-desc">Description</Label>
              <Textarea id="rm-desc" name="description" rows={2} />
            </div>
            <Button type="submit" className="w-full">Create roadmap</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
