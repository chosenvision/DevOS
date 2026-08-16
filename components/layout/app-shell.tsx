"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { QuickAddDialog } from "@/components/layout/quick-add-dialog";

interface AppShellProps {
  children: React.ReactNode;
  name: string;
  email: string;
  avatarUrl: string | null;
  projects: { id: string; name: string }[];
}

export function AppShell({ children, name, email, avatarUrl, projects }: AppShellProps) {
  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={name} email={email} avatarUrl={avatarUrl} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <CommandPalette />
      <QuickAddDialog projects={projects} />
    </div>
  );
}
