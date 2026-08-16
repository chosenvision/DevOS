"use client";

import * as React from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateNotificationPreferences } from "@/services/actions/preferences";
import type { UserPreferences } from "@/types/database";

const TOGGLES: { key: keyof UserPreferences; name: string; label: string; description: string }[] = [
  { key: "email_notifications", name: "emailNotifications", label: "Email notifications", description: "Receive a digest by email." },
  { key: "push_notifications", name: "pushNotifications", label: "Push notifications", description: "In-app and browser alerts." },
  { key: "notify_task_due", name: "notifyTaskDue", label: "Task due soon", description: "Get reminded before a task is due." },
  { key: "notify_project_deadline", name: "notifyProjectDeadline", label: "Project deadlines", description: "Alerts as a project deadline approaches." },
  { key: "notify_interview_reminder", name: "notifyInterviewReminder", label: "Interview reminders", description: "Never miss a scheduled interview." },
  { key: "notify_follow_up", name: "notifyFollowUp", label: "Follow-up reminders", description: "Contacts and applications due for follow-up." },
  { key: "notify_habit_streak", name: "notifyHabitStreak", label: "Habit streaks", description: "Celebrate and protect your streaks." },
];

export function NotificationsForm({ preferences }: { preferences: UserPreferences }) {
  const [values, setValues] = React.useState(preferences);
  const [pending, startTransition] = React.useTransition();

  function handleSave() {
    const fd = new FormData();
    for (const t of TOGGLES) {
      if (values[t.key]) fd.set(t.name, "on");
    }
    startTransition(async () => {
      const res = await updateNotificationPreferences(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Notification preferences saved.");
    });
  }

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {TOGGLES.map((t) => (
          <div key={t.key} className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-normal">{t.label}</Label>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </div>
            <Switch
              checked={!!values[t.key]}
              onCheckedChange={(checked) => setValues((v) => ({ ...v, [t.key]: checked }))}
            />
          </div>
        ))}
        <Button onClick={handleSave} disabled={pending}>
          {pending ? "Saving..." : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
