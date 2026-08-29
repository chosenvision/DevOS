"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, Plus, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setActiveOrganization, createOrganization, type ActionState } from "@/services/actions/organizations";
import { runAction } from "@/lib/action-feedback";
import { cn } from "@/lib/utils";
import type { Organization } from "@/types/database";

const initialState: ActionState = {};

function CreateOrgDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [state, formAction] = useActionState(createOrganization, initialState);
  const lastState = React.useRef(state);

  React.useEffect(() => {
    if (state !== lastState.current) {
      lastState.current = state;
      if (state.success) onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New organization</DialogTitle>
          <DialogDescription>A separate workspace for its own clients, deals, and team.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Name</Label>
            <Input id="org-name" name="name" required autoFocus placeholder="Acme Studio" />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface OrgRow {
  organizations: Organization | null;
}

function readActiveOrgCookie(): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("active_org_id="))
    ?.split("=")[1];
}

/**
 * Only renders once the user belongs to an organization — Business is an
 * opt-in module, so most first-time visitors here see nothing until their
 * first visit to /business auto-provisions a default org.
 */
export function OrgSwitcher() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);

  const { data: orgs = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("organization_members")
        .select("organizations(*)")
        .eq("status", "active");
      return ((data ?? []) as unknown as OrgRow[])
        .map((r) => r.organizations)
        .filter((o): o is Organization => Boolean(o));
    },
  });

  React.useEffect(() => {
    if (!createOpen) queryClient.invalidateQueries({ queryKey: ["organizations"] });
  }, [createOpen, queryClient]);

  if (orgs.length === 0) return null;

  const activeId = typeof document !== "undefined" ? readActiveOrgCookie() : undefined;
  const active = orgs.find((o) => o.id === activeId) ?? orgs[0];

  return (
    <>
      <DropdownMenu onOpenChange={(open) => open && queryClient.invalidateQueries({ queryKey: ["organizations"] })}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex">
            <Building2 className="size-3.5" />
            <span className="max-w-32 truncate">{active.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs">Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {orgs.map((org) => (
            <DropdownMenuItem key={org.id} onSelect={() => runAction(() => setActiveOrganization(org.id))}>
              <Check className={cn("size-3.5", org.id !== active.id && "opacity-0")} />
              <span className="truncate">{org.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
            <Plus className="size-3.5" /> New organization
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/business/team">
              <Users className="size-3.5" /> Manage team
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
