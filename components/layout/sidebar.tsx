import Link from "next/link";
import { Terminal, Plus } from "lucide-react";

import { MAIN_NAV, FOOTER_NAV } from "@/lib/nav-config";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { QuickAddTrigger } from "@/components/layout/quick-add-trigger";

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center gap-2 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground">
          <span className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Terminal className="size-3.5" />
          </span>
          DevOS
        </Link>
      </div>

      <div className="px-3 pb-3">
        <QuickAddTrigger className="flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar px-2.5 py-1.5 text-sm text-sidebar-foreground/70 shadow-xs hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <Plus className="size-4" />
          Quick add
          <kbd className="ml-auto rounded border border-sidebar-border bg-sidebar-accent/60 px-1.5 py-0.5 font-mono text-[10px] text-sidebar-foreground/60">
            ⌘K
          </kbd>
        </QuickAddTrigger>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <SidebarNav items={MAIN_NAV} />
      </div>

      <div className="border-t border-sidebar-border px-3 py-3">
        <SidebarNav items={FOOTER_NAV} />
      </div>
    </aside>
  );
}
