"use client";

import * as React from "react";
import { toast } from "sonner";
import { ExternalLink, Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { createResource, updateResourceStatus, deleteResource } from "@/services/actions/learning";
import { runAction } from "@/lib/action-feedback";
import type { Resource, ResourceStatus } from "@/types/database";

const STATUS_LABEL: Record<ResourceStatus, string> = {
  unread: "Unread",
  reading: "Reading",
  completed: "Completed",
  saved_for_later: "Saved for later",
};

export function ResourcesPageClient({ resources }: { resources: Resource[] }) {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<string>("all");
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createResource({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  const filtered = filter === "all" ? resources : resources.filter((r) => r.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All resources</SelectItem>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Save resource
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No resources saved yet."
          description="Save articles, docs, videos, and tools as you come across them."
          actionLabel="Save resource"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((r) => (
            <Card key={r.id} className="gap-2 py-3">
              <div className="flex items-start justify-between gap-2 px-4">
                <p className="min-w-0 truncate text-sm font-medium">{r.title}</p>
                <Button size="icon" variant="ghost" className="size-6" onClick={() => runAction(() => deleteResource(r.id))} aria-label="Remove resource">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {r.description && <p className="line-clamp-2 px-4 text-xs text-muted-foreground">{r.description}</p>}
              <div className="flex items-center justify-between px-4">
                <Select value={r.status} onValueChange={(v) => runAction(() => updateResourceStatus(r.id, v))}>
                  <SelectTrigger size="sm" className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  {r.rating && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="size-3 fill-current" /> {r.rating}
                    </span>
                  )}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
              {r.category && (
                <div className="px-4">
                  <Badge variant="secondary">{r.category}</Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save resource</DialogTitle>
            <DialogDescription>Add a link to your library.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="r-title">Title</Label>
              <Input id="r-title" name="title" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-url">URL</Label>
              <Input id="r-url" name="url" type="url" placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="r-category">Category</Label>
                <Input id="r-category" name="category" placeholder="Article" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="r-tags">Tags</Label>
                <Input id="r-tags" name="tags" placeholder="react, testing" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-desc">Description</Label>
              <Textarea id="r-desc" name="description" rows={2} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <SubmitButton>Save resource</SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
