"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav-config";

export function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  // Scopes the shared-layout indicator to this instance — SidebarNav renders multiple times at
  // once (desktop main/footer nav, mobile sheet main/footer nav), and a layoutId shared across
  // separately-mounted instances makes framer-motion treat them as one animated group.
  const instanceId = React.useId();

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={reducedMotion ? undefined : `sidebar-active-indicator-${instanceId}`}
                className="absolute left-0 h-4 w-0.5 rounded-full bg-sidebar-primary"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                aria-hidden
              />
            )}
            <item.icon
              className={cn(
                "size-4 shrink-0 transition-[color,transform] duration-150 group-hover:scale-110 group-active:scale-95",
                active ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
              )}
            />
            <span className="transition-transform duration-150 group-hover:translate-x-0.5">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
