"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateAiPreferences } from "@/services/actions/preferences";
import type { UserPreferences } from "@/types/database";

export function AiForm({ preferences, configured }: { preferences: UserPreferences; configured: boolean }) {
  const [enabled, setEnabled] = React.useState(preferences.ai_enabled);

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          AI features
          <Badge variant={configured ? "success" : "muted"}>
            {configured ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
            {configured ? "Connected" : "Not Connected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="font-normal">Enable AI tools</Label>
            <p className="text-xs text-muted-foreground">
              Resume tailoring, cover letter generation, and (once Gmail is connected) Career Inbox
              drafting. Only ever uses data already in your account — resumes, career profile, job
              listings — and only when you trigger a specific tool.
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
        {!configured && (
          <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
            No AI provider key is set. Add <code className="rounded bg-muted px-1 py-0.5">ANTHROPIC_API_KEY</code> to
            your environment (see <code className="rounded bg-muted px-1 py-0.5">.env.local.example</code>) to enable
            these tools — no code changes needed, they&apos;ll switch on automatically.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
