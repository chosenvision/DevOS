"use client";

import * as React from "react";
import { toast } from "sonner";
import { ExternalLink, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { createCodingProblem, markProblemAttempted, deleteCodingProblem } from "@/services/actions/coding-practice";
import { runAction } from "@/lib/action-feedback";
import { CODING_PLATFORMS, DIFFICULTY_LABEL } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { CodingProblem, DifficultyLevel } from "@/types/database";

const DIFFICULTY_BADGE: Record<DifficultyLevel, "muted" | "warning" | "destructive"> = {
  easy: "muted",
  medium: "warning",
  hard: "destructive",
};


function ProblemCard({ problem }: { problem: CodingProblem }) {
  return (
    <Card className="gap-2 py-3">
      <div className="flex items-start justify-between gap-2 px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{problem.name}</p>
          <p className="text-xs text-muted-foreground">{problem.platform}</p>
        </div>
        <Button size="icon" variant="ghost" className="size-6" onClick={() => runAction(() => deleteCodingProblem(problem.id))} aria-label="Delete problem">
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 px-4">
        <Badge variant={DIFFICULTY_BADGE[problem.difficulty]}>{DIFFICULTY_LABEL[problem.difficulty]}</Badge>
        {problem.topic.slice(0, 2).map((t) => (
          <Badge key={t} variant="secondary">{t}</Badge>
        ))}
        {problem.status === "completed" && <Badge variant="success">Solved</Badge>}
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => runAction(() => markProblemAttempted(problem.id, true))}>
            Solved
          </Button>
          <Button size="sm" variant="outline" onClick={() => runAction(() => markProblemAttempted(problem.id, false))}>
            Attempted
          </Button>
        </div>
        {problem.url && (
          <a href={problem.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      {(problem.attempts > 0 || problem.review_date) && (
        <p className="px-4 text-[11px] text-muted-foreground">
          {problem.attempts} attempt{problem.attempts === 1 ? "" : "s"}
          {problem.review_date ? ` · review ${formatShortDate(problem.review_date)}` : ""}
        </p>
      )}
    </Card>
  );
}

export function CodingPracticePageClient({ problems }: { problems: CodingProblem[] }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createCodingProblem({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  const dueForReview = problems.filter((p) => p.review_date && new Date(p.review_date) <= new Date());
  const todo = problems.filter((p) => p.status !== "completed");
  const solved = problems.filter((p) => p.status === "completed");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add problem
        </Button>
      </div>

      {problems.length === 0 ? (
        <EmptyState
          title="No coding problems tracked yet."
          description="Add problems from LeetCode, HackerRank, or anywhere else you practice."
          actionLabel="Add problem"
          onAction={() => setOpen(true)}
        />
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({problems.length})</TabsTrigger>
            <TabsTrigger value="review">Due for review ({dueForReview.length})</TabsTrigger>
            <TabsTrigger value="todo">To solve ({todo.length})</TabsTrigger>
            <TabsTrigger value="solved">Solved ({solved.length})</TabsTrigger>
          </TabsList>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <TabsContent value="all" className="contents">
              {problems.map((p) => <ProblemCard key={p.id} problem={p} />)}
            </TabsContent>
            <TabsContent value="review" className="contents">
              {dueForReview.map((p) => <ProblemCard key={p.id} problem={p} />)}
            </TabsContent>
            <TabsContent value="todo" className="contents">
              {todo.map((p) => <ProblemCard key={p.id} problem={p} />)}
            </TabsContent>
            <TabsContent value="solved" className="contents">
              {solved.map((p) => <ProblemCard key={p.id} problem={p} />)}
            </TabsContent>
          </div>
        </Tabs>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add coding problem</DialogTitle>
            <DialogDescription>Track something to practice or review later.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-name">Problem name</Label>
              <Input id="cp-name" name="name" required autoFocus placeholder="Two Sum" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Platform</Label>
                <Select name="platform" defaultValue="LeetCode">
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CODING_PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select name="difficulty" defaultValue="medium">
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFFICULTY_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-url">URL</Label>
              <Input id="cp-url" name="url" type="url" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-topic">Topics</Label>
              <Input id="cp-topic" name="topic" placeholder="Arrays, Hash Maps" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <SubmitButton>Add problem</SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
