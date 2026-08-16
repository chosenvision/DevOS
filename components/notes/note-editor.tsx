"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Pencil, Pin, PinOff, Star, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateNote, toggleNoteFlag, deleteNote } from "@/services/actions/notes";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/database";

export function NoteEditor({ note }: { note: Note }) {
  const router = useRouter();
  const [title, setTitle] = React.useState(note.title);
  const [content, setContent] = React.useState(note.content);
  const [tags, setTags] = React.useState(note.tags.join(", "));
  const [pinned, setPinned] = React.useState(note.is_pinned);
  const [favorite, setFavorite] = React.useState(note.is_favorite);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleSave(next: { title?: string; content?: string; tags?: string[] }) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateNote(note.id, next);
    }, 800);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleSave({ title: e.target.value });
          }}
          className="h-auto border-none px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
        />
        <div className="flex shrink-0 gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              setPinned((p) => !p);
              await toggleNoteFlag(note.id, "is_pinned", !pinned);
            }}
            aria-label={pinned ? "Unpin note" : "Pin note"}
          >
            {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              setFavorite((f) => !f);
              await toggleNoteFlag(note.id, "is_favorite", !favorite);
            }}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={cn("size-4", favorite && "fill-current text-warning")} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="text-destructive" aria-label="Delete note">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await deleteNote(note.id);
                    router.push("/notes");
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Input
        value={tags}
        onChange={(e) => {
          setTags(e.target.value);
          scheduleSave({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) });
        }}
        placeholder="Tags, comma separated"
        className="h-8 max-w-sm text-xs"
      />
      {tags && (
        <div className="flex flex-wrap gap-1.5">
          {tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
      )}

      <Tabs defaultValue="write">
        <TabsList>
          <TabsTrigger value="write"><Pencil className="size-3.5" /> Write</TabsTrigger>
          <TabsTrigger value="preview"><Eye className="size-3.5" /> Preview</TabsTrigger>
        </TabsList>
        <div className="mt-3">
          <TabsContent value="write">
            <Textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                scheduleSave({ content: e.target.value });
              }}
              rows={18}
              className="font-mono text-sm"
              placeholder="Write in markdown..."
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border border-border p-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*Nothing to preview yet.*"}</ReactMarkdown>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
