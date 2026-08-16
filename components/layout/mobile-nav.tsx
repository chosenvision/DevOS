"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Terminal } from "lucide-react";

import { MAIN_NAV, FOOTER_NAV } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar">
        <SheetHeader>
          <SheetTitle asChild>
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold" onClick={() => setOpen(false)}>
              <span className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Terminal className="size-3.5" />
              </span>
              DevOS
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarNav items={MAIN_NAV} onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t border-sidebar-border px-3 py-3">
          <SidebarNav items={FOOTER_NAV} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
