"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIORITY_LABEL, TASK_STATUS_LABEL, TASK_STATUS_ORDER } from "@/lib/constants";

export interface TaskFilters {
  search: string;
  projectId: string;
  priority: string;
  status: string;
}

interface TasksFilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  projects: { id: string; name: string }[];
}

export function TasksFilterBar({ filters, onChange, projects }: TasksFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative max-w-xs flex-1">
        <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks..."
          className="pl-8"
        />
      </div>
      <Select value={filters.projectId} onValueChange={(v) => onChange({ ...filters, projectId: v })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Project" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          <SelectItem value="none">No project</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.priority} onValueChange={(v) => onChange({ ...filters, priority: v })}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(v) => onChange({ ...filters, status: v })}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {TASK_STATUS_ORDER.map((s) => (
            <SelectItem key={s} value={s}>{TASK_STATUS_LABEL[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
