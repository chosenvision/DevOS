import { Badge } from "@/components/ui/badge";
import type { CalendarEventType } from "@/types/database";

const TYPE_LABEL: Record<CalendarEventType, string> = {
  task: "Task",
  deadline: "Deadline",
  interview: "Interview",
  study_session: "Study",
  course_deadline: "Course",
  goal: "Goal",
  reminder: "Reminder",
  custom: "Event",
};

const TYPE_VARIANT: Record<CalendarEventType, "default" | "secondary" | "outline" | "warning" | "destructive"> = {
  task: "secondary",
  deadline: "warning",
  interview: "destructive",
  study_session: "outline",
  course_deadline: "outline",
  goal: "default",
  reminder: "secondary",
  custom: "outline",
};

export function EventTypeBadge({ type }: { type: CalendarEventType }) {
  return <Badge variant={TYPE_VARIANT[type]}>{TYPE_LABEL[type]}</Badge>;
}

export { TYPE_LABEL as EVENT_TYPE_LABEL };
