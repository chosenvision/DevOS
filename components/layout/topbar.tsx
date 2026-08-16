"use client";

import { Plus, Search } from "lucide-react";

import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { ActiveTimerPill } from "@/components/layout/active-timer-pill";

interface TopbarProps {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export function Topbar({ name, email, avatarUrl }: TopbarProps) {
  const { setCommandPaletteOpen, openQuickAdd } = useUIStore();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <MobileNav />

      <button
        type="button"
        onClick={() => setCommandPaletteOpen(true)}
        className="flex h-8 flex-1 max-w-sm items-center gap-2 rounded-md border border-input bg-secondary/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary lg:max-w-xs"
      >
        <Search className="size-3.5" />
        Search or jump to...
        <kbd className="ml-auto hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <ActiveTimerPill />
        <Button size="sm" onClick={() => openQuickAdd()} className="hidden sm:inline-flex">
          <Plus className="size-4" />
          Quick add
        </Button>
        <Button size="icon" variant="ghost" onClick={() => openQuickAdd()} className="sm:hidden" aria-label="Quick add">
          <Plus className="size-4" />
        </Button>
        <NotificationsMenu />
        <ThemeToggle />
        <UserMenu name={name} email={email} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
