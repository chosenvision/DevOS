"use client";

import { toast } from "sonner";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { updateApplicationStatus, deleteApplication } from "@/services/actions/career";
import { runAction } from "@/lib/action-feedback";
import { APPLICATION_STATUS_LABEL, APPLICATION_STATUS_ORDER } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { JobApplication } from "@/types/database";

export function ApplicationsTable({ applications }: { applications: JobApplication[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead>Follow up</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell className="font-medium">{app.company_name}</TableCell>
            <TableCell>{app.position}</TableCell>
            <TableCell className="text-muted-foreground">
              {app.location ?? "—"} {app.work_mode && <Badge variant="outline" className="ml-1">{app.work_mode}</Badge>}
            </TableCell>
            <TableCell>
              <Select
                value={app.status}
                onValueChange={async (v) => {
                  const res = await updateApplicationStatus(app.id, v);
                  if (res.error) toast.error(res.error);
                }}
              >
                <SelectTrigger size="sm" className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {app.date_applied ? formatShortDate(app.date_applied) : "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {app.next_follow_up_at ? formatShortDate(app.next_follow_up_at) : "—"}
            </TableCell>
            <TableCell>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={() => runAction(() => deleteApplication(app.id))}
                aria-label="Delete application"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
