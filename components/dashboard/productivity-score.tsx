import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function scoreCopy(score: number) {
  if (score >= 80) return "You're in a strong rhythm this week.";
  if (score >= 55) return "Steady progress — a couple more focused sessions would help.";
  if (score >= 30) return "A quieter week. Picking one small task back up can restart momentum.";
  return "No pressure — this is just a signal, not a grade. Pick one thing to start with.";
}

export function ProductivityScore({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="size-4" /> Productivity Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-muted)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <text
            x="32"
            y="34"
            textAnchor="middle"
            className="rotate-90 fill-foreground text-[15px] font-semibold"
            style={{ transform: "rotate(90deg)", transformOrigin: "32px 32px" }}
          >
            {score}
          </text>
        </svg>
        <p className="text-sm text-muted-foreground">{scoreCopy(score)}</p>
      </CardContent>
    </Card>
  );
}
