"use client";

import { Plus, Search } from "lucide-react";

import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { ActiveTimerPill } from "@/components/layout/active-timer-pill";
import { OrgSwitcher } from "@/components/layout/org-switcher";

interface TopbarProps {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export function Topbar({ name, email, avatarUrl }: TopbarProps) {
  const { setCommandPaletteOpen, openQuickAdd } = useUIStore();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <MobileNav />

      <button
        type="button"
        onClick={() => setCommandPaletteOpen(true)}
        className="flex h-8 flex-1 max-w-sm items-center gap-2 rounded-md border border-input bg-secondary/40 px-3 text-sm text-muted-foreground shadow-xs transition-all duration-150 hover:border-ring/40 hover:bg-secondary active:scale-[0.99] lg:max-w-xs"
      >
        <Search className="size-3.5" />
        Search or jump to...
        <kbd className="ml-auto hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <OrgSwitcher />
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
