import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, actionLabel, onAction, href, icon: Icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
      {Icon && (
        <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {actionLabel && (onAction || href) && (
        <Button size="sm" className="mt-2" onClick={onAction} asChild={!!href}>
          {href ? <a href={href}>{actionLabel}</a> : <span>{actionLabel}</span>}
        </Button>
      )}
    </div>
  );
}
