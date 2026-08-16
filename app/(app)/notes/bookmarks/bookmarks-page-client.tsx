"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Bookmark as BookmarkIcon, ExternalLink, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { createBookmark, deleteBookmark, type ActionState } from "@/services/actions/snippets";
import { formatShortDate } from "@/lib/utils";
import type { Bookmark } from "@/types/database";

const initialState: ActionState = {};

export function BookmarksPageClient({ bookmarks }: { bookmarks: Bookmark[] }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState(createBookmark, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    }
  }, [state]);

  if (bookmarks.length === 0) {
    return (
      <>
        <EmptyState title="No bookmarks yet." description="Save links you want to read or reference later." actionLabel="Save bookmark" onAction={() => setOpen(true)} icon={BookmarkIcon} />
        <BookmarkDialog open={open} onOpenChange={setOpen} formAction={formAction} state={state} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Save bookmark
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {bookmarks.map((b) => (
          <Card key={b.id} className="gap-1.5 py-3">
            <div className="flex items-start justify-between gap-2 px-4">
              <a href={b.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium hover:underline">
                {b.title} <ExternalLink className="size-3 shrink-0" />
              </a>
              <Button size="icon" variant="ghost" className="size-6" onClick={() => deleteBookmark(b.id)} aria-label="Remove bookmark">
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <p className="truncate px-4 text-xs text-muted-foreground">{b.website}</p>
            <div className="flex items-center justify-between px-4">
              {b.category && <Badge variant="secondary">{b.category}</Badge>}
              <span className="text-[11px] text-muted-foreground">{formatShortDate(b.date_saved)}</span>
            </div>
          </Card>
        ))}
      </div>
      <BookmarkDialog open={open} onOpenChange={setOpen} formAction={formAction} state={state} />
    </div>
  );
}

function BookmarkDialog({
  open,
  onOpenChange,
  formAction,
  state,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formAction: (formData: FormData) => void;
  state: ActionState;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save bookmark</DialogTitle>
          <DialogDescription>Quickly save a link for later.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bm-title">Title</Label>
            <Input id="bm-title" name="title" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bm-url">URL</Label>
            <Input id="bm-url" name="url" type="url" required placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bm-category">Category</Label>
            <Input id="bm-category" name="category" placeholder="Article" />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full">Save bookmark</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
