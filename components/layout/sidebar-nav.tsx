"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav-config";

export function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();

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
            <span
              className={cn(
                "absolute left-0 h-4 w-0.5 rounded-full bg-sidebar-primary transition-opacity",
                active ? "opacity-100" : "opacity-0"
              )}
              aria-hidden
            />
            <item.icon
              className={cn(
                "size-4 shrink-0 transition-[color,transform] duration-150 group-hover:scale-110",
                active ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
              )}
            />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
