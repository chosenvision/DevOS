"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CheckSquare,
  FolderKanban,
  NotebookPen,
  Briefcase,
  Building2,
  Timer,
  Lightbulb,
  CalendarDays,
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Laptop,
  Search,
} from "lucide-react";

import { useUIStore } from "@/lib/stores/ui-store";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandPalette() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { commandPaletteOpen, setCommandPaletteOpen, openQuickAdd } = useUIStore();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const run = (fn: () => void) => {
    setCommandPaletteOpen(false);
    fn();
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Search or run a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Create">
          <CommandItem onSelect={() => run(() => openQuickAdd("task"))}>
            <CheckSquare /> Create task
          </CommandItem>
          <CommandItem onSelect={() => run(() => openQuickAdd("project"))}>
            <FolderKanban /> Create project
          </CommandItem>
          <CommandItem onSelect={() => run(() => openQuickAdd("note"))}>
            <NotebookPen /> Create note
          </CommandItem>
          <CommandItem onSelect={() => run(() => openQuickAdd("application"))}>
            <Briefcase /> Add job application
          </CommandItem>
          <CommandItem onSelect={() => run(() => openQuickAdd("idea"))}>
            <Lightbulb /> Capture idea
          </CommandItem>
          <CommandItem onSelect={() => run(() => openQuickAdd("coding_session"))}>
            <Timer /> Start timer
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run(() => router.push("/dashboard"))}>
            <LayoutDashboard /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/projects"))}>
            <FolderKanban /> Projects
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/tasks"))}>
            <CheckSquare /> Tasks
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/learning"))}>
            <GraduationCap /> Learning Hub
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/career"))}>
            <Briefcase /> Career Hub
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/business"))}>
            <Building2 /> Business
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/notes"))}>
            <NotebookPen /> Notes
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/analytics"))}>
            <BarChart3 /> Analytics
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/calendar"))}>
            <CalendarDays /> Calendar
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/settings"))}>
            <Settings /> Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Search">
          <CommandItem onSelect={() => run(() => router.push("/notes"))}>
            <Search /> Search notes
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => run(() => setTheme("light"))}>
            <Sun /> Light
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme("dark"))}>
            <Moon /> Dark
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme("system"))}>
            <Laptop /> System
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
