"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckSquare,
  FolderKanban,
  NotebookPen,
  Briefcase,
  BookMarked,
  Timer,
  Lightbulb,
} from "lucide-react";

import { useUIStore, type QuickAddType } from "@/lib/stores/ui-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { createTask } from "@/services/actions/tasks";
import { createNote } from "@/services/actions/notes";
import { createApplication } from "@/services/actions/career";
import { createResource } from "@/services/actions/learning";
import { createIdea } from "@/services/actions/ideas";
import { startTimer } from "@/services/actions/time-entries";

interface ProjectOption {
  id: string;
  name: string;
}

const TABS: { value: QuickAddType; label: string; icon: React.ElementType }[] = [
  { value: "task", label: "Task", icon: CheckSquare },
  { value: "project", label: "Project", icon: FolderKanban },
  { value: "note", label: "Note", icon: NotebookPen },
  { value: "application", label: "Job", icon: Briefcase },
  { value: "resource", label: "Resource", icon: BookMarked },
  { value: "coding_session", label: "Session", icon: Timer },
  { value: "idea", label: "Idea", icon: Lightbulb },
];

type QuickActionState = { error?: string; success?: string; id?: string };
const emptyState: QuickActionState = {};

function TaskQuickForm({ projects, onDone }: { projects: ProjectOption[]; onDone: () => void }) {
  const [state, formAction] = useActionState(createTask, emptyState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="qa-title">Title</Label>
        <Input id="qa-title" name="title" autoFocus required placeholder="Write the API docs" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select name="priority" defaultValue="medium">
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qa-due">Due date</Label>
          <Input id="qa-due" name="dueDate" type="date" />
        </div>
      </div>
      {projects.length > 0 && (
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select name="projectId">
            <SelectTrigger className="w-full"><SelectValue placeholder="No project" /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton>Create task</SubmitButton>
    </form>
  );
}

function ProjectQuickForm({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Projects need a bit more detail — open the full form to set status, tech stack, and deadlines.
      </p>
      <button
        type="button"
        onClick={() => {
          onNavigate();
          router.push("/projects?new=1");
        }}
        className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Open new project form
      </button>
    </div>
  );
}

function NoteQuickForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState(createNote, emptyState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onDone();
      if (state.id) router.push(`/notes/${state.id}`);
    }
  }, [state, onDone, router]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="qa-note-title">Title</Label>
        <Input id="qa-note-title" name="title" autoFocus required placeholder="Meeting notes, an idea, a snippet..." />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qa-note-content">Content</Label>
        <Textarea id="qa-note-content" name="content" rows={4} placeholder="Start typing... (Markdown supported)" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton>Create note</SubmitButton>
    </form>
  );
}

function ApplicationQuickForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState(createApplication, emptyState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="qa-company">Company</Label>
          <Input id="qa-company" name="companyName" autoFocus required placeholder="Acme Inc." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qa-position">Position</Label>
          <Input id="qa-position" name="position" required placeholder="Frontend Engineer" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select name="status" defaultValue="saved">
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="saved">Saved</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton>Add application</SubmitButton>
    </form>
  );
}

function ResourceQuickForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState(createResource, emptyState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="qa-res-title">Title</Label>
        <Input id="qa-res-title" name="title" autoFocus required placeholder="Epic React by Kent C. Dodds" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qa-res-url">URL</Label>
        <Input id="qa-res-url" name="url" type="url" placeholder="https://..." />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton>Save resource</SubmitButton>
    </form>
  );
}

function IdeaQuickForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState(createIdea, emptyState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="qa-idea-title">Idea</Label>
        <Input id="qa-idea-title" name="title" autoFocus required placeholder="A habit tracker with a heatmap" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qa-idea-desc">Description</Label>
        <Textarea id="qa-idea-desc" name="description" rows={3} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton>Capture idea</SubmitButton>
    </form>
  );
}

function CodingSessionQuickForm({ projects, onDone }: { projects: ProjectOption[]; onDone: () => void }) {
  async function action(formData: FormData) {
    const res = await startTimer({
      projectId: (formData.get("projectId") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      category: "project",
    });
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Timer started — track it from Time Tracking.");
      onDone();
    }
  }

  return (
    <form action={action} className="space-y-3">
      <p className="text-sm text-muted-foreground">Starts a live timer. Stop it any time from Time Tracking.</p>
      {projects.length > 0 && (
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select name="projectId">
            <SelectTrigger className="w-full"><SelectValue placeholder="No project" /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="qa-session-desc">What are you working on?</Label>
        <Input id="qa-session-desc" name="description" placeholder="Refactoring the auth flow" />
      </div>
      <SubmitButton>Start timer</SubmitButton>
    </form>
  );
}

export function QuickAddDialog({ projects }: { projects: ProjectOption[] }) {
  const { quickAddOpen, quickAddType, closeQuickAdd, openQuickAdd } = useUIStore();

  return (
    <Dialog open={quickAddOpen} onOpenChange={(open) => (open ? openQuickAdd(quickAddType) : closeQuickAdd())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick add</DialogTitle>
          <DialogDescription>Capture something without leaving where you are.</DialogDescription>
        </DialogHeader>
        <Tabs value={quickAddType} onValueChange={(v) => openQuickAdd(v as QuickAddType)}>
          <TabsList className="grid w-full grid-cols-4 gap-1 sm:grid-cols-7">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} title={tab.label}>
                <tab.icon className="size-3.5" />
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-4">
            <TabsContent value="task">
              <TaskQuickForm projects={projects} onDone={closeQuickAdd} />
            </TabsContent>
            <TabsContent value="project">
              <ProjectQuickForm onNavigate={closeQuickAdd} />
            </TabsContent>
            <TabsContent value="note">
              <NoteQuickForm onDone={closeQuickAdd} />
            </TabsContent>
            <TabsContent value="application">
              <ApplicationQuickForm onDone={closeQuickAdd} />
            </TabsContent>
            <TabsContent value="resource">
              <ResourceQuickForm onDone={closeQuickAdd} />
            </TabsContent>
            <TabsContent value="coding_session">
              <CodingSessionQuickForm projects={projects} onDone={closeQuickAdd} />
            </TabsContent>
            <TabsContent value="idea">
              <IdeaQuickForm onDone={closeQuickAdd} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
