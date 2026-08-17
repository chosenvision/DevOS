import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { PlugZap } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ConnectionRequiredProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  requirements: string[];
}

/**
 * Honest placeholder for features that need an external integration DevOS
 * doesn't have credentials for yet (rule: never fake a connected state).
 * The full data model and UI for the feature already exist — only the
 * live connection is missing. See .env.example and Settings → Integrations.
 */
export function ConnectionRequired({ title, description, icon: Icon = PlugZap, requirements }: ConnectionRequiredProps) {
  return (
    <Card className="items-center gap-4 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div className="max-w-md space-y-1 px-6">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="max-w-sm space-y-1.5 rounded-lg border border-dashed border-border px-4 py-3 text-left">
        <p className="text-xs font-medium text-muted-foreground">Requires:</p>
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          {requirements.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </div>
      <Button size="sm" variant="outline" asChild>
        <Link href="/settings/integrations">Go to Settings → Integrations</Link>
      </Button>
    </Card>
  );
}
