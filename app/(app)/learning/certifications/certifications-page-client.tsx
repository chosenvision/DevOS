"use client";

import * as React from "react";
import { toast } from "sonner";
import { Award, ExternalLink, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { createCertification, deleteCertification } from "@/services/actions/learning";
import { formatDate } from "@/lib/utils";
import type { Certification } from "@/types/database";

export function CertificationsPageClient({ certifications }: { certifications: Certification[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <EmptyState
          title="No certifications yet."
          description="Add certificates you've earned to keep them all in one place."
          actionLabel="Add certification"
          onAction={() => setOpen(true)}
          icon={Award}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {certifications.map((cert) => {
            const expiringSoon =
              cert.expiration_date &&
              new Date(cert.expiration_date) > new Date() &&
              new Date(cert.expiration_date).getTime() - Date.now() < 60 * 86400000;
            const expired = cert.expiration_date && new Date(cert.expiration_date) < new Date();

            return (
              <Card key={cert.id} className="gap-2 py-3">
                <div className="flex items-start justify-between gap-2 px-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{cert.name}</p>
                    <p className="text-xs text-muted-foreground">{cert.provider}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="size-6" onClick={() => deleteCertification(cert.id)} aria-label="Remove certification">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 px-4">
                  {cert.date_earned && <Badge variant="secondary">Earned {formatDate(cert.date_earned)}</Badge>}
                  {expired && <Badge variant="destructive">Expired</Badge>}
                  {expiringSoon && !expired && <Badge variant="warning">Expiring soon</Badge>}
                </div>
                {cert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-4">
                    {cert.skills.map((s) => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))}
                  </div>
                )}
                {cert.credential_url && (
                  <div className="px-4">
                    <a href={cert.credential_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      View credential <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add certification</DialogTitle>
            <DialogDescription>Keep track of what you've earned.</DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              const res = await createCertification(formData);
              if (res.error) toast.error(res.error);
              else setOpen(false);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cert-name">Certification</Label>
                <Input id="cert-name" name="name" required autoFocus placeholder="AWS Certified Developer" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cert-provider">Provider</Label>
                <Input id="cert-provider" name="provider" required placeholder="Amazon Web Services" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cert-earned">Date earned</Label>
                <Input id="cert-earned" name="dateEarned" type="date" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cert-expiration">Expiration date</Label>
                <Input id="cert-expiration" name="expirationDate" type="date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cert-id">Credential ID</Label>
                <Input id="cert-id" name="credentialId" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cert-url">Credential URL</Label>
                <Input id="cert-url" name="credentialUrl" type="url" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cert-skills">Skills</Label>
              <Input id="cert-skills" name="skills" placeholder="AWS, Cloud Architecture" />
            </div>
            <Button type="submit" className="w-full">Add certification</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
