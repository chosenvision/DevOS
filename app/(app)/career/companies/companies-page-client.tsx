"use client";

import * as React from "react";
import { toast } from "sonner";
import { Building2, ExternalLink, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { createCompany, deleteCompany } from "@/services/actions/companies";
import type { Company } from "@/types/database";

export function CompaniesPageClient({ companies }: { companies: Company[] }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createCompany({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add company
        </Button>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          title="No companies tracked yet."
          description="Research companies you&apos;re interested in and keep notes here."
          actionLabel="Add company"
          onAction={() => setOpen(true)}
          icon={Building2}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {companies.map((c) => (
            <Card key={c.id} className="gap-2 py-3">
              <div className="flex items-start justify-between gap-2 px-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[c.industry, c.location].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <Button size="icon" variant="ghost" className="size-6" onClick={() => deleteCompany(c.id)} aria-label="Remove company">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {c.notes && <p className="line-clamp-2 px-4 text-xs text-muted-foreground">{c.notes}</p>}
              {c.website && (
                <div className="px-4">
                  <a href={c.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    Website <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add company</DialogTitle>
            <DialogDescription>Keep research notes on a company you&apos;re interested in.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="co-name">Company name</Label>
              <Input id="co-name" name="name" required autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="co-industry">Industry</Label>
                <Input id="co-industry" name="industry" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-size">Size</Label>
                <Input id="co-size" name="size" placeholder="50-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="co-location">Location</Label>
                <Input id="co-location" name="location" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-website">Website</Label>
                <Input id="co-website" name="website" type="url" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co-notes">Notes</Label>
              <Textarea id="co-notes" name="notes" rows={2} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <SubmitButton>Add company</SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
