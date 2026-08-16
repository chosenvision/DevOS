"use client";

import * as React from "react";
import { toast } from "sonner";
import { Eye, Flag, RotateCcw, SkipForward, Timer } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { updateQuestionConfidence } from "@/services/actions/interview-prep";
import type { InterviewQuestion } from "@/types/database";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MockInterview({ questions }: { questions: InterviewQuestion[] }) {
  const [order, setOrder] = React.useState<InterviewQuestion[]>([]);
  const [index, setIndex] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [marked, setMarked] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setOrder(shuffle(questions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  React.useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [index]);

  if (questions.length === 0) {
    return <EmptyState title="Add a few questions first." description="Mock interview mode pulls from your question bank." />;
  }

  const current = order[index];
  if (!current) return null;

  function next() {
    setShowAnswer(false);
    setSeconds(0);
    setIndex((i) => (i + 1) % order.length);
  }

  function restart() {
    setOrder(shuffle(questions));
    setIndex(0);
    setShowAnswer(false);
    setSeconds(0);
    setMarked(new Set());
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {index + 1} of {order.length}</span>
        <span className="flex items-center gap-1 font-mono tabular-nums">
          <Timer className="size-3.5" /> {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
        </span>
      </div>

      <Card className="py-6">
        <CardContent className="space-y-4 text-center">
          <Badge variant="secondary">{current.category.replace("_", " ")}</Badge>
          <p className="text-lg font-medium">{current.question}</p>
          {showAnswer && current.answer && (
            <p className="rounded-md bg-muted p-3 text-left text-sm text-muted-foreground">{current.answer}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" onClick={() => setShowAnswer((s) => !s)}>
          <Eye className="size-4" /> {showAnswer ? "Hide answer" : "Show answer"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setMarked((prev) => new Set(prev).add(current.id));
            toast.info("Marked for review.");
          }}
        >
          <Flag className="size-4" /> Mark for review
        </Button>
        <Button variant="outline" onClick={restart}>
          <RotateCcw className="size-4" /> Restart
        </Button>
        <Button onClick={next}>
          <SkipForward className="size-4" /> Next
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <span className="text-xs text-muted-foreground">Confidence:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={async () => {
              await updateQuestionConfidence(current.id, n);
              next();
            }}
            className="flex size-6 items-center justify-center rounded-full border border-border text-xs hover:border-primary hover:text-primary"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
