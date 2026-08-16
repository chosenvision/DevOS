import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  GraduationCap,
  Briefcase,
  NotebookPen,
  BarChart3,
  CalendarDays,
  Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Learning", href: "/learning", icon: GraduationCap },
  { title: "Career", href: "/career", icon: Briefcase },
  { title: "Notes", href: "/notes", icon: NotebookPen },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
];

export const FOOTER_NAV: NavItem[] = [{ title: "Settings", href: "/settings", icon: Settings }];
