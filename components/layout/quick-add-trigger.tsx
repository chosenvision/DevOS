"use client";

import { useUIStore, type QuickAddType } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";

export function QuickAddTrigger({
  type,
  className,
  children,
}: {
  type?: QuickAddType;
  className?: string;
  children: React.ReactNode;
}) {
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);

  return (
    <button type="button" onClick={() => openQuickAdd(type)} className={cn(className)}>
      {children}
    </button>
  );
}
