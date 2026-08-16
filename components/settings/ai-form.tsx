"use client";

import * as React from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateAiPreferences } from "@/services/actions/preferences";
import type { UserPreferences } from "@/types/database";

export function AiForm({ preferences }: { preferences: UserPreferences }) {
  const [enabled, setEnabled] = React.useState(preferences.ai_enabled);

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">AI features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="font-normal">Enable AI tools</Label>
            <p className="text-xs text-muted-foreground">
              Reserved for upcoming AI tools — project planner, resume writer, and learning roadmap
              generator. This toggle controls whether they&apos;ll be offered once available.
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={async (checked) => {
              setEnabled(checked);
              const fd = new FormData();
              if (checked) fd.set("aiEnabled", "on");
              const res = await updateAiPreferences(fd);
              if (res.error) toast.error(res.error);
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          No AI provider is connected yet in this build. When one is, DevOS will only use data already
          in your account — projects, skills, and notes — and only when you trigger a specific tool.
        </p>
      </CardContent>
    </Card>
  );
}
