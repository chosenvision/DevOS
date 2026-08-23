"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { createInterviewQuestion, deleteInterviewQuestion } from "@/services/actions/interview-prep";
import { runAction } from "@/lib/action-feedback";
import { DIFFICULTY_LABEL } from "@/lib/constants";
import type { InterviewCategory, InterviewQuestion } from "@/types/database";

const CATEGORY_LABEL: Record<InterviewCategory, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  sql: "SQL",
  frontend: "Frontend",
  backend: "Backend",
  system_design: "System Design",
  hr: "HR",
  company_specific: "Company Specific",
};

export function InterviewQuestionsList({ questions }: { questions: InterviewQuestion[] }) {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<string>("all");
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createInterviewQuestion({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  const filtered = filter === "all" ? questions : questions.filter((q) => q.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add question
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No questions yet." description="Add questions to build your prep bank." actionLabel="Add question" onAction={() => setOpen(true)} />
      ) : (
        <div className="space-y-2">
          {filtered.map((q) => (
            <Card key={q.id} className="gap-1.5 py-3">
              <div className="flex items-start justify-between gap-2 px-4">
                <p className="text-sm font-medium">{q.question}</p>
                <Button size="icon" variant="ghost" className="size-6" onClick={() => runAction(() => deleteInterviewQuestion(q.id))} aria-label="Delete question">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {q.answer && <p className="line-clamp-2 px-4 text-xs text-muted-foreground">{q.answer}</p>}
              <div className="flex flex-wrap gap-1.5 px-4">
                <Badge variant="secondary">{CATEGORY_LABEL[q.category]}</Badge>
                <Badge variant="outline">{DIFFICULTY_LABEL[q.difficulty]}</Badge>
                <Badge variant="muted">Confidence {q.confidence_level}/5</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add question</DialogTitle>
            <DialogDescription>Add it to your interview prep bank.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="iq-question">Question</Label>
              <Textarea id="iq-question" name="question" required autoFocus rows={2} placeholder="Tell me about a time you disagreed with a teammate." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select name="category" defaultValue="behavioral">
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
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
              <Label htmlFor="iq-answer">Your answer</Label>
              <Textarea id="iq-answer" name="answer" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iq-notes">Notes</Label>
              <Textarea id="iq-notes" name="notes" rows={2} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <SubmitButton>Add question</SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
