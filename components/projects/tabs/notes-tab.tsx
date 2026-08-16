"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import { createNote } from "@/services/actions/notes";
import { formatShortDate, truncate } from "@/lib/utils";
import type { Note } from "@/types/database";

export function NotesTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const { data: notes = [], refetch } = useQuery({
    queryKey: ["project-notes", projectId],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false });
      return (data ?? []) as Note[];
    },
  });

  async function formAction(formData: FormData) {
    const res = await createNote({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
    refetch();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New note
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          title="No notes for this project yet."
          description="Capture decisions, meeting notes, and ideas as you build."
          actionLabel="New note"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card className="gap-1.5 py-3 hover:border-primary/40">
                <p className="truncate px-4 text-sm font-medium">{note.title}</p>
                <p className="line-clamp-2 px-4 text-xs text-muted-foreground">
                  {truncate(note.content.replace(/[#*`_>-]/g, ""), 140)}
                </p>
                <p className="px-4 text-[11px] text-muted-foreground">{formatShortDate(note.updated_at)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New note</DialogTitle>
            <DialogDescription>Attached to this project.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="type" value="project" />
            <div className="space-y-1.5">
              <Label htmlFor="n-title">Title</Label>
              <Input id="n-title" name="title" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="n-content">Content</Label>
              <Textarea id="n-content" name="content" rows={5} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Create note</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
