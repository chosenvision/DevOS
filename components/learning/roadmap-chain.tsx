"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, ExternalLink, Plus, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { addRoadmapStep, updateRoadmapStepStatus, deleteRoadmap } from "@/services/actions/learning";
import { cn } from "@/lib/utils";
import type { RoadmapWithSteps } from "@/services/queries/learning";

export function RoadmapChain({ roadmap }: { roadmap: RoadmapWithSteps }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Card className="py-4">
      <div className="flex items-center justify-between px-5">
        <div>
          <p className="font-medium">{roadmap.title}</p>
          {roadmap.description && <p className="text-xs text-muted-foreground">{roadmap.description}</p>}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Delete roadmap">
              <Trash2 className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{roadmap.title}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>This removes the roadmap and all its steps.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteRoadmap(roadmap.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="px-5">
        {roadmap.steps.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No steps yet.</p>
        ) : (
          <ol className="space-y-0">
            {roadmap.steps.map((step, i) => (
              <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
                {i < roadmap.steps.length - 1 && (
                  <span
                    className={cn(
                      "absolute top-6 left-[11px] h-full w-px",
                      step.status === "completed" ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium",
                    step.status === "completed" && "border-primary bg-primary text-primary-foreground",
                    step.status === "current" && "border-primary text-primary",
                    step.status === "upcoming" && "border-border text-muted-foreground"
                  )}
                >
                  {step.status === "completed" ? <Check className="size-3" /> : i + 1}
                </span>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", step.status === "upcoming" && "text-muted-foreground")}>
                      {step.title}
                    </p>
                    {step.status === "current" && <Badge>Current</Badge>}
                  </div>
                  {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
                  <div className="mt-1 flex items-center gap-3">
                    {step.status !== "completed" && (
                      <button
                        className="text-xs text-primary hover:underline"
                        onClick={async () => {
                          const res = await updateRoadmapStepStatus(step.id, "completed");
                          if (res.error) toast.error(res.error);
                        }}
                      >
                        Mark complete
                      </button>
                    )}
                    {step.resource_url && (
                      <a href={step.resource_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        Resource <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="px-5">
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="size-3.5" /> Add step
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add roadmap step</DialogTitle>
            <DialogDescription>Add to &ldquo;{roadmap.title}&rdquo;.</DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              const res = await addRoadmapStep(roadmap.id, formData);
              if (res.error) toast.error(res.error);
              else setOpen(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="rs-title">Step</Label>
              <Input id="rs-title" name="title" required autoFocus placeholder="TypeScript" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rs-desc">Description</Label>
              <Textarea id="rs-desc" name="description" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rs-url">Resource URL</Label>
              <Input id="rs-url" name="resourceUrl" type="url" />
            </div>
            <Button type="submit" className="w-full">Add step</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
