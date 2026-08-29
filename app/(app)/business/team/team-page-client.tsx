"use client";

import * as React from "react";
import { CalendarPlus, Check, DollarSign, Trash2, UserPlus, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { PayrollFormDialog } from "@/components/business/payroll-form-dialog";
import { TimeOffFormDialog } from "@/components/business/time-off-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { runAction } from "@/lib/action-feedback";
import { inviteMember, updateMemberRole, removeMember, leaveOrganization } from "@/services/actions/organizations";
import { deletePayrollRecord, cancelTimeOffRequest, reviewTimeOffRequest } from "@/services/actions/payroll";
import { initials, formatCurrency, formatShortDate } from "@/lib/utils";
import { PAYROLL_STATUS_LABEL, TIME_OFF_STATUS_BADGE, TIME_OFF_STATUS_LABEL, TIME_OFF_TYPE_LABEL } from "@/lib/constants";
import type { OrganizationMemberWithProfile, OrgRole } from "@/types/database";
import type { PayrollRecordWithMember, TimeOffRequestWithMember } from "@/services/queries/payroll";

const ROLE_LABEL: Record<OrgRole, string> = { owner: "Owner", admin: "Admin", member: "Member" };

export function TeamPageClient({
  organizationId,
  currentUserId,
  currentRole,
  members,
  payrollRecords,
  timeOffRequests,
}: {
  organizationId: string;
  currentUserId: string;
  currentRole: OrgRole;
  members: OrganizationMemberWithProfile[];
  payrollRecords: PayrollRecordWithMember[];
  timeOffRequests: TimeOffRequestWithMember[];
}) {
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"admin" | "member">("member");
  const [submitting, setSubmitting] = React.useState(false);
  const [payrollDialogOpen, setPayrollDialogOpen] = React.useState(false);
  const [timeOffDialogOpen, setTimeOffDialogOpen] = React.useState(false);

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
    <Tabs defaultValue="members">
      <TabsList>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="payroll">Payroll</TabsTrigger>
        <TabsTrigger value="time-off">Time Off</TabsTrigger>
      </TabsList>

      <TabsContent value="members" className="mt-4 space-y-6">
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
      </TabsContent>

      <TabsContent value="payroll" className="mt-4">
        <Card className="py-4">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm">Payroll</CardTitle>
              <p className="text-xs text-muted-foreground">
                A manual record — this doesn&apos;t process payment, taxes, or direct deposit.
              </p>
            </div>
            {canManage && (
              <Button size="sm" onClick={() => setPayrollDialogOpen(true)}>
                <DollarSign className="size-3.5" /> Record payroll
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {payrollRecords.length === 0 ? (
              <EmptyState title="No payroll recorded yet." description="Record a pay period once you've paid a teammate outside DevOS." />
            ) : (
              <ul className="divide-y divide-border">
                {payrollRecords.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <div>
                      <p className="font-medium">{r.member_name ?? "Team member"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatShortDate(r.pay_period_start)} – {formatShortDate(r.pay_period_end)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(r.gross_amount, r.currency)}</span>
                      <Badge variant="secondary">{PAYROLL_STATUS_LABEL[r.status]}</Badge>
                      {canManage && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive"
                          aria-label="Delete payroll record"
                          onClick={() => runAction(() => deletePayrollRecord(organizationId, r.id))}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="time-off" className="mt-4">
        <Card className="py-4">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Time off</CardTitle>
            <Button size="sm" onClick={() => setTimeOffDialogOpen(true)}>
              <CalendarPlus className="size-3.5" /> Request time off
            </Button>
          </CardHeader>
          <CardContent>
            {timeOffRequests.length === 0 ? (
              <EmptyState title="No time off requests yet." description="Request vacation, sick, or unpaid time off." />
            ) : (
              <ul className="divide-y divide-border">
                {timeOffRequests.map((r) => {
                  const isOwnRequest = members.find((m) => m.id === r.member_id)?.user_id === currentUserId;

                  return (
                    <li key={r.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                      <div>
                        <p className="font-medium">
                          {r.member_name ?? "Team member"} · {TIME_OFF_TYPE_LABEL[r.type]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatShortDate(r.start_date)} – {formatShortDate(r.end_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={TIME_OFF_STATUS_BADGE[r.status]}>{TIME_OFF_STATUS_LABEL[r.status]}</Badge>
                        {canManage && r.status === "pending" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-success"
                              aria-label="Approve"
                              onClick={() => runAction(() => reviewTimeOffRequest(organizationId, r.id, "approved"))}
                            >
                              <Check className="size-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-destructive"
                              aria-label="Deny"
                              onClick={() => runAction(() => reviewTimeOffRequest(organizationId, r.id, "denied"))}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </>
                        )}
                        {r.status === "pending" && isOwnRequest && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 text-destructive"
                            aria-label="Cancel request"
                            onClick={() => runAction(() => cancelTimeOffRequest(organizationId, r.id))}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <PayrollFormDialog organizationId={organizationId} members={members} open={payrollDialogOpen} onOpenChange={setPayrollDialogOpen} />
      <TimeOffFormDialog organizationId={organizationId} open={timeOffDialogOpen} onOpenChange={setTimeOffDialogOpen} />
    </Tabs>
  );
}
