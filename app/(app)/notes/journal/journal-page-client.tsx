"use client";

import * as React from "react";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { upsertDailyLog } from "@/services/actions/notes";
import { formatDate } from "@/lib/utils";
import type { DailyLog } from "@/types/database";

const FIELDS = [
  { name: "whatWorkedOn", key: "what_worked_on", label: "What did you work on?" },
  { name: "whatLearned", key: "what_learned", label: "What did you learn?" },
  { name: "blockers", key: "blockers", label: "Any blockers?" },
  { name: "tomorrowPlan", key: "tomorrow_plan", label: "Plan for tomorrow" },
] as const;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function JournalPageClient({ logs }: { logs: DailyLog[] }) {
  const today = todayIso();
  const todayEntry = logs.find((l) => l.log_date === today);
  const pastEntries = logs.filter((l) => l.log_date !== today);
  const [error, setError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await upsertDailyLog({}, formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      setError(undefined);
      toast.success(res.success);
    });
  }

  return (
    <div className="space-y-6">
      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">
            Today &middot; {formatDate(today)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="logDate" value={today} />
            {FIELDS.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={f.name}>{f.label}</Label>
                <Textarea id={f.name} name={f.name} rows={2} defaultValue={todayEntry?.[f.key] ?? ""} />
              </div>
            ))}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : todayEntry ? "Update entry" : "Save entry"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Past entries</h3>
        {pastEntries.length === 0 ? (
          <EmptyState title="No past entries yet." description="Come back tomorrow — your journal builds up day by day." icon={BookOpen} />
        ) : (
          <div className="space-y-3">
            {pastEntries.map((log) => (
              <Card key={log.id} className="gap-2 py-4">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground">{formatDate(log.log_date)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {FIELDS.map((f) =>
                    log[f.key] ? (
                      <div key={f.name}>
                        <p className="text-[11px] font-medium text-muted-foreground">{f.label}</p>
                        <p className="text-sm whitespace-pre-wrap">{log[f.key]}</p>
                      </div>
                    ) : null
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
