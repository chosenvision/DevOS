"use client";

import { ClipboardList, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { AssessmentFormDialog } from "@/components/career/assessment-form-dialog";
import { deleteAssessment, updateAssessmentStatus } from "@/services/actions/career";
import { runAction } from "@/lib/action-feedback";
import { formatShortDate } from "@/lib/utils";
import { ASSESSMENT_STATUS_LABEL, ASSESSMENT_TYPE_LABEL } from "@/lib/constants";
import type { Assessment } from "@/types/database";

const STATUS_VARIANT: Record<Assessment["status"], "muted" | "warning" | "default" | "success" | "destructive"> = {
  not_started: "muted",
  in_progress: "warning",
  submitted: "default",
  passed: "success",
  failed: "destructive",
};

export function AssessmentsPageClient({ assessments }: { assessments: Assessment[] }) {
  if (assessments.length === 0) {
    return (
      <>
        <div className="mb-4 flex justify-end">
          <AssessmentFormDialog />
        </div>
        <EmptyState
          title="No assessments tracked yet."
          description="Technical screens, take-homes, and case studies — with deadlines that also show up in Tasks."
          icon={ClipboardList}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AssessmentFormDialog />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assessments.map((a) => (
          <Card key={a.id} className="gap-2 py-4">
            <div className="flex items-start justify-between gap-2 px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{a.company_name}</p>
                {a.role && <p className="truncate text-xs text-muted-foreground">{a.role}</p>}
              </div>
              <Button size="icon" variant="ghost" className="size-6" onClick={() => runAction(() => deleteAssessment(a.id))} aria-label="Delete assessment">
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 px-5">
              <Badge variant="secondary">{ASSESSMENT_TYPE_LABEL[a.assessment_type]}</Badge>
              {a.platform && <Badge variant="muted">{a.platform}</Badge>}
            </div>
            <div className="px-5 text-xs text-muted-foreground">
              {a.deadline ? `Due ${formatShortDate(a.deadline)}` : "No deadline set"}
              {a.score && ` · Score: ${a.score}`}
            </div>
            <div className="px-5">
              <Select value={a.status} onValueChange={(v) => runAction(() => updateAssessmentStatus(a.id, v))}>
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue>
                    <Badge variant={STATUS_VARIANT[a.status]}>{ASSESSMENT_STATUS_LABEL[a.status]}</Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSESSMENT_STATUS_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
