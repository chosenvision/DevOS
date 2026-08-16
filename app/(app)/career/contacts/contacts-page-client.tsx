"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Contact as ContactIcon, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { createContact, deleteContact, markContacted, setFollowUp, type ActionState } from "@/services/actions/companies";
import { formatShortDate } from "@/lib/utils";
import type { Contact } from "@/types/database";

const initialState: ActionState = {};

export function ContactsPageClient({ contacts }: { contacts: Contact[] }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState(createContact, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    }
  }, [state]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet."
          description="Keep track of recruiters, referrals, and people you've networked with."
          actionLabel="Add contact"
          onAction={() => setOpen(true)}
          icon={ContactIcon}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contacts.map((c) => {
            const dueToday = c.next_follow_up_at && new Date(c.next_follow_up_at) <= new Date();
            return (
              <Card key={c.id} className="gap-2 py-3">
                <div className="flex items-start justify-between gap-2 px-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[c.role, c.company?.name].filter(Boolean).join(" at ") || "—"}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="size-6" onClick={() => deleteContact(c.id)} aria-label="Remove contact">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 px-4">
                  {c.last_contacted_at && (
                    <Badge variant="secondary">Last contacted {formatShortDate(c.last_contacted_at)}</Badge>
                  )}
                  {c.next_follow_up_at && (
                    <Badge variant={dueToday ? "warning" : "outline"}>
                      Follow up {formatShortDate(c.next_follow_up_at)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 px-4">
                  <Button size="sm" variant="outline" onClick={() => markContacted(c.id)}>
                    Mark contacted
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">Set reminder</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => setFollowUp(c.id, 7)}>Follow up in 7 days</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setFollowUp(c.id, 30)}>Reconnect in 30 days</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription>A recruiter, referral, or professional connection.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ct-name">Name</Label>
                <Input id="ct-name" name="name" required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ct-role">Role</Label>
                <Input id="ct-role" name="role" placeholder="Technical Recruiter" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ct-email">Email</Label>
                <Input id="ct-email" name="email" type="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ct-linkedin">LinkedIn</Label>
                <Input id="ct-linkedin" name="linkedinUrl" type="url" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ct-relationship">Relationship</Label>
              <Input id="ct-relationship" name="relationship" placeholder="Former colleague" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ct-notes">Notes</Label>
              <Textarea id="ct-notes" name="notes" rows={2} />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <SubmitButton>Add contact</SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
