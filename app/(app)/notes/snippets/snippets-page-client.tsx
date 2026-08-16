"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Check, Copy, Plus, Search, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { CodeBlock } from "@/components/notes/code-block";
import { createSnippet, toggleSnippetFavorite, deleteSnippet, type ActionState } from "@/services/actions/snippets";
import type { CodeSnippet } from "@/types/database";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "PHP", "SQL", "HTML", "CSS", "Java", "C++", "Shell", "JSON"];

const initialState: ActionState = {};

function SnippetCard({ snippet }: { snippet: CodeSnippet }) {
  const [copied, setCopied] = React.useState(false);

  return (
    <Card className="gap-2 py-3">
      <div className="flex items-start justify-between gap-2 px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{snippet.title}</p>
          {snippet.description && <p className="truncate text-xs text-muted-foreground">{snippet.description}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            onClick={() => {
              navigator.clipboard.writeText(snippet.code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            aria-label="Copy code"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            onClick={() => toggleSnippetFavorite(snippet.id, !snippet.is_favorite)}
            aria-label="Favorite"
          >
            <Star className={snippet.is_favorite ? "size-3.5 fill-current text-warning" : "size-3.5"} />
          </Button>
          <Button size="icon" variant="ghost" className="size-6" onClick={() => deleteSnippet(snippet.id)} aria-label="Delete snippet">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="px-4">
        <CodeBlock code={snippet.code} language={snippet.language} />
      </div>
      <div className="flex flex-wrap gap-1.5 px-4">
        <Badge variant="secondary">{snippet.language}</Badge>
        {snippet.category && <Badge variant="outline">{snippet.category}</Badge>}
      </div>
    </Card>
  );
}

export function SnippetsPageClient({ snippets }: { snippets: CodeSnippet[] }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [lang, setLang] = React.useState("all");
  const [state, formAction] = useActionState(createSnippet, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    }
  }, [state]);

  const filtered = snippets.filter((s) => {
    if (lang !== "all" && s.language !== lang) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (snippets.length === 0) {
    return (
      <>
        <EmptyState title="No snippets saved yet." description="Save reusable code you reach for often." actionLabel="New snippet" onAction={() => setOpen(true)} />
        <SnippetDialog open={open} onOpenChange={setOpen} formAction={formAction} state={state} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search snippets..." className="pl-8" />
        </div>
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            {LANGUAGES.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New snippet
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((s) => (
          <SnippetCard key={s.id} snippet={s} />
        ))}
      </div>

      <SnippetDialog open={open} onOpenChange={setOpen} formAction={formAction} state={state} />
    </div>
  );
}

function SnippetDialog({
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New snippet</DialogTitle>
          <DialogDescription>Save code you&apos;ll want to reuse.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sn-title">Title</Label>
              <Input id="sn-title" name="title" required autoFocus placeholder="Debounce hook" />
            </div>
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select name="language" defaultValue="TypeScript">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sn-code">Code</Label>
            <Textarea id="sn-code" name="code" required rows={8} className="font-mono text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sn-category">Category</Label>
              <Input id="sn-category" name="category" placeholder="Hooks" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sn-tags">Tags</Label>
              <Input id="sn-tags" name="tags" placeholder="react, utils" />
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full">Save snippet</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
