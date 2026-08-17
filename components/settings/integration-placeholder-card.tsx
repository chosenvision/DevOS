import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IntegrationPlaceholderCardProps {
  name: string;
  icon: LucideIcon;
  description: string;
  requirements: string[];
}

/**
 * Honest "not wired up yet" state for an integration whose UI/architecture
 * exists but has no credentials configured (Gmail, Google Calendar,
 * LinkedIn). Never render a fake "Connected" state — see .env.example for
 * what each of these actually needs.
 */
export function IntegrationPlaceholderCard({ name, icon: Icon, description, requirements }: IntegrationPlaceholderCardProps) {
  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="size-4" /> {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          <Badge variant="muted" className="shrink-0">
            Not Connected
          </Badge>
        </div>
        <div className="rounded-md border border-dashed border-border p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Requires:</p>
          <ul className="space-y-0.5 text-xs text-muted-foreground">
            {requirements.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
        <Button size="sm" variant="outline" disabled title="Connection Required — see .env.example">
          Connect (setup required)
        </Button>
      </CardContent>
    </Card>
  );
}
