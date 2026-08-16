"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Pin, Plus, Search, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { createNote, type ActionState } from "@/services/actions/notes";
import { formatShortDate, truncate } from "@/lib/utils";
import type { Note, NoteType } from "@/types/database";

const TYPE_LABEL: Record<NoteType, string> = {
  general: "General",
  project: "Project",
  learning: "Learning",
  interview: "Interview",
  meeting: "Meeting",
  code: "Code",
  idea: "Idea",
};

const initialState: ActionState = {};

export function NotesPageClient({ notes }: { notes: Note[] }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("all");
  const [state, formAction] = useActionState(createNote, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    }
  }, [state]);

  const active = notes.filter((n) => !n.is_archived);
  const filtered = active.filter((n) => {
    if (type !== "all" && n.type !== type) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (notes.length === 0) {
    return (
      <>
        <EmptyState
          title="No notes yet."
          description="Capture meeting notes, ideas, and decisions as markdown."
          actionLabel="New note"
          onAction={() => setOpen(true)}
        />
        <NoteDialog open={open} onOpenChange={setOpen} formAction={formAction} state={state} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="pl-8" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New note
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No notes match your search.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card className="h-full gap-2 py-3 hover:border-primary/40">
                <div className="flex items-start justify-between gap-2 px-4">
                  <p className="min-w-0 truncate text-sm font-medium">{note.title}</p>
                  <div className="flex shrink-0 gap-1">
                    {note.is_pinned && <Pin className="size-3.5 text-primary" />}
                    {note.is_favorite && <Star className="size-3.5 fill-current text-warning" />}
                  </div>
                </div>
                <p className="line-clamp-3 px-4 text-xs text-muted-foreground">
                  {truncate(note.content.replace(/[#*`_>[\]-]/g, ""), 160) || "No content yet."}
                </p>
                <div className="flex items-center justify-between px-4">
                  <Badge variant="secondary">{TYPE_LABEL[note.type]}</Badge>
                  <span className="text-[11px] text-muted-foreground">{formatShortDate(note.updated_at)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <NoteDialog open={open} onOpenChange={setOpen} formAction={formAction} state={state} />
    </div>
  );
}

function NoteDialog({
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
          <DialogTitle>New note</DialogTitle>
          <DialogDescription>Markdown supported — headings, lists, links, code blocks.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="note-title">Title</Label>
            <Input id="note-title" name="title" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select name="type" defaultValue="general">
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note-content">Content</Label>
            <Textarea id="note-content" name="content" rows={5} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note-tags">Tags</Label>
            <Input id="note-tags" name="tags" placeholder="ideas, meeting" />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full">Create note</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
