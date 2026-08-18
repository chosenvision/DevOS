"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Folder, FolderPlus, Pin, Plus, Search, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { createNote, createNoteFolder, deleteNoteFolder } from "@/services/actions/notes";
import { cn } from "@/lib/utils";
import { formatShortDate, truncate } from "@/lib/utils";
import type { Note, NoteFolder, NoteType } from "@/types/database";

const TYPE_LABEL: Record<NoteType, string> = {
  general: "General",
  project: "Project",
  learning: "Learning",
  interview: "Interview",
  meeting: "Meeting",
  code: "Code",
  idea: "Idea",
};

export function NotesPageClient({ notes, folders }: { notes: Note[]; folders: NoteFolder[] }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("all");
  const [folderFilter, setFolderFilter] = React.useState("all");
  const [addingFolder, setAddingFolder] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState("");
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createNote({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  async function handleAddFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    const res = await createNoteFolder(name);
    if (res.error) toast.error(res.error);
    setNewFolderName("");
    setAddingFolder(false);
  }

  const active = notes.filter((n) => !n.is_archived);
  const filtered = active.filter((n) => {
    if (type !== "all" && n.type !== type) return false;
    if (folderFilter === "unfiled" && n.folder_id) return false;
    if (folderFilter !== "all" && folderFilter !== "unfiled" && n.folder_id !== folderFilter) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (notes.length === 0 && folders.length === 0) {
    return (
      <>
        <EmptyState
          title="No notes yet."
          description="Capture meeting notes, ideas, and decisions as markdown."
          actionLabel="New note"
          onAction={() => setOpen(true)}
        />
        <NoteDialog open={open} onOpenChange={setOpen} formAction={formAction} error={error} folders={folders} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant={folderFilter === "all" ? "secondary" : "ghost"}
          className="h-7 px-2.5 text-xs"
          onClick={() => setFolderFilter("all")}
        >
          All notes
        </Button>
        <Button
          size="sm"
          variant={folderFilter === "unfiled" ? "secondary" : "ghost"}
          className="h-7 px-2.5 text-xs"
          onClick={() => setFolderFilter("unfiled")}
        >
          Unfiled
        </Button>
        {folders.map((f) => (
          <div key={f.id} className="group relative">
            <Button
              size="sm"
              variant={folderFilter === f.id ? "secondary" : "ghost"}
              className="h-7 gap-1.5 px-2.5 pr-6 text-xs"
              onClick={() => setFolderFilter(f.id)}
            >
              <Folder className="size-3" /> {f.name}
            </Button>
            <button
              type="button"
              aria-label={`Delete folder ${f.name}`}
              className="absolute top-1/2 right-1.5 hidden -translate-y-1/2 text-muted-foreground hover:text-destructive group-hover:block"
              onClick={() => {
                if (folderFilter === f.id) setFolderFilter("all");
                deleteNoteFolder(f.id);
              }}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        {addingFolder ? (
          <div className="flex items-center gap-1">
            <Input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFolder();
                } else if (e.key === "Escape") {
                  setAddingFolder(false);
                  setNewFolderName("");
                }
              }}
              onBlur={() => !newFolderName.trim() && setAddingFolder(false)}
              placeholder="Folder name"
              className="h-7 w-32 text-xs"
            />
          </div>
        ) : (
          <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs text-muted-foreground" onClick={() => setAddingFolder(true)}>
            <FolderPlus className="size-3" /> New folder
          </Button>
        )}
      </div>

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
              <Card className={cn("h-full gap-2 py-3 hover:border-primary/40")}>
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

      <NoteDialog open={open} onOpenChange={setOpen} formAction={formAction} error={error} folders={folders} />
    </div>
  );
}

function NoteDialog({
  open,
  onOpenChange,
  formAction,
  error,
  folders,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formAction: (formData: FormData) => void;
  error?: string;
  folders: NoteFolder[];
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
          <div className="grid grid-cols-2 gap-3">
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
            {folders.length > 0 && (
              <div className="space-y-1.5">
                <Label>Folder</Label>
                <Select name="folderId" defaultValue="none">
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unfiled</SelectItem>
                    {folders.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note-content">Content</Label>
            <Textarea id="note-content" name="content" rows={5} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note-tags">Tags</Label>
            <Input id="note-tags" name="tags" placeholder="ideas, meeting" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Create note</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
