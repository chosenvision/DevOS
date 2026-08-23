"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, EyeOff, Star, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import {
  addProjectToPortfolio,
  updatePortfolioEntry,
  reorderPortfolioEntry,
  removeFromPortfolio,
} from "@/services/actions/portfolio";
import { runAction } from "@/lib/action-feedback";
import type { PortfolioProject, Project } from "@/types/database";

export function PortfolioPageClient({
  entries,
  projects,
  username,
}: {
  entries: PortfolioProject[];
  projects: Project[];
  username: string | null;
}) {
  const addableProjects = projects.filter((p) => !entries.some((e) => e.project_id === p.id));

  return (
    <div className="space-y-6">
      {username ? (
        <p className="text-sm text-muted-foreground">
          Your public portfolio is live at{" "}
          <Link href={`/portfolio/${username}`} target="_blank" className="text-primary hover:underline">
            /portfolio/{username}
          </Link>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Set a username in <Link href="/settings/profile" className="text-primary hover:underline">Settings → Profile</Link> to get a public portfolio URL.
        </p>
      )}

      {addableProjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={(id) => runAction(() => addProjectToPortfolio(id))}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Add a project to your portfolio" /></SelectTrigger>
            <SelectContent>
              {addableProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState title="Nothing in your portfolio yet." description="Add a project above to start building your public showcase." />
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <Card key={entry.id} className="gap-3 py-4">
              <div className="flex items-start justify-between gap-2 px-5">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{entry.title}</p>
                  {entry.is_published ? <Badge variant="success">Published</Badge> : <Badge variant="muted">Draft</Badge>}
                  {entry.is_featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="size-7" disabled={i === 0} onClick={() => runAction(() => reorderPortfolioEntry(entry.id, "up"))} aria-label="Move up">
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="size-7" disabled={i === entries.length - 1} onClick={() => runAction(() => reorderPortfolioEntry(entry.id, "down"))} aria-label="Move down">
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    onClick={() => runAction(() => updatePortfolioEntry(entry.id, { is_featured: !entry.is_featured }))}
                    aria-label="Toggle featured"
                  >
                    <Star className={entry.is_featured ? "size-3.5 fill-current text-warning" : "size-3.5"} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    onClick={async () => {
                      const res = await updatePortfolioEntry(entry.id, { is_published: !entry.is_published });
                      if (res.error) toast.error(res.error);
                    }}
                    aria-label={entry.is_published ? "Unpublish" : "Publish"}
                  >
                    {entry.is_published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="size-7" onClick={() => runAction(() => removeFromPortfolio(entry.id))} aria-label="Remove">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 px-5 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Role</label>
                  <input
                    defaultValue={entry.role ?? ""}
                    onBlur={(e) => updatePortfolioEntry(entry.id, { role: e.target.value })}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                    placeholder="Solo developer"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Outcome</label>
                  <input
                    defaultValue={entry.outcome ?? ""}
                    onBlur={(e) => updatePortfolioEntry(entry.id, { outcome: e.target.value })}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                    placeholder="Shipped to 200 users in the first month"
                  />
                </div>
              </div>
              <div className="grid gap-3 px-5 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Problem</label>
                  <Textarea
                    defaultValue={entry.problem ?? ""}
                    onBlur={(e) => updatePortfolioEntry(entry.id, { problem: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Solution</label>
                  <Textarea
                    defaultValue={entry.solution ?? ""}
                    onBlur={(e) => updatePortfolioEntry(entry.id, { solution: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
