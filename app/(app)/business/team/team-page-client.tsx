"use client";

import * as React from "react";
import { UserPlus, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { runAction } from "@/lib/action-feedback";
import { inviteMember, updateMemberRole, removeMember, leaveOrganization } from "@/services/actions/organizations";
import { initials } from "@/lib/utils";
import type { OrganizationMemberWithProfile, OrgRole } from "@/types/database";

const ROLE_LABEL: Record<OrgRole, string> = { owner: "Owner", admin: "Admin", member: "Member" };

export function TeamPageClient({
  organizationId,
  currentUserId,
  currentRole,
  members,
}: {
  organizationId: string;
  currentUserId: string;
  currentRole: OrgRole;
  members: OrganizationMemberWithProfile[];
}) {
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"admin" | "member">("member");
  const [submitting, setSubmitting] = React.useState(false);

  const canManage = currentRole === "owner" || currentRole === "admin";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.set("email", inviteEmail.trim());
    fd.set("role", inviteRole);
    const res = await runAction(() => inviteMember(organizationId, fd), "Invited.");
    if (!res.error) setInviteEmail("");
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <Card className="py-4">
          <CardHeader>
            <CardTitle className="text-sm">Invite a teammate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@example.com"
                />
              </div>
              <div className="space-y-1.5 sm:w-36">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "member")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={submitting}>
                <UserPlus className="size-4" /> Invite
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {members.map((m) => {
            const isSelf = m.user_id === currentUserId;
            const label = m.profile?.full_name || m.invited_email || "Unknown";

            return (
              <div key={m.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/40">
                <Avatar className="size-8">
                  <AvatarImage src={m.profile?.avatar_url ?? undefined} alt={label} />
                  <AvatarFallback>{initials(label)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {label} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                  </p>
                  {m.status === "invited" ? (
                    <p className="text-xs text-muted-foreground">Pending invite</p>
                  ) : (
                    m.profile?.full_name &&
                    m.invited_email && <p className="truncate text-xs text-muted-foreground">{m.invited_email}</p>
                  )}
                </div>

                {canManage && currentRole === "owner" && m.role !== "owner" ? (
                  <Select
                    value={m.role}
                    onValueChange={(v) => runAction(() => updateMemberRole(organizationId, m.id, v as "admin" | "member"))}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={m.role === "owner" ? "default" : "secondary"}>{ROLE_LABEL[m.role]}</Badge>
                )}

                {isSelf && m.role !== "owner" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-destructive" aria-label="Leave organization">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Leave this organization?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You&apos;ll lose access to its clients, deals, and invoices unless you&apos;re invited back.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => runAction(() => leaveOrganization(organizationId))}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Leave
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  canManage &&
                  !isSelf &&
                  m.role !== "owner" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive" aria-label={`Remove ${label}`}>
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {label}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            They&apos;ll immediately lose access to this organization&apos;s clients, deals, and invoices.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => runAction(() => removeMember(organizationId, m.id))}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
