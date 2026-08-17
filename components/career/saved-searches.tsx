"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Bell, BellOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createJobSearch, deleteJobSearch, toggleJobSearchNotify } from "@/services/actions/career";
import type { JobSearch } from "@/types/database";

export function SavedSearches({ searches }: { searches: JobSearch[] }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createJobSearch({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Saved Searches</h3>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="size-3.5" /> New search
        </Button>
      </div>

      {searches.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No saved searches yet. Name a search like &ldquo;Data Analyst — Remote&rdquo; to keep your criteria handy.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {searches.map((s) => (
            <Card key={s.id} className="flex-row items-center gap-2 py-2 pr-2 pl-3">
              <span className="text-sm font-medium">{s.name}</span>
              {s.titles.slice(0, 1).map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
              <Button
                size="icon"
                variant="ghost"
                className="size-6"
                aria-label={s.notify_on_match ? "Alerts on" : "Alerts off"}
                title={s.notify_on_match ? "Alerts on (requires job discovery connection)" : "Alerts off"}
                onClick={() => toggleJobSearchNotify(s.id, !s.notify_on_match)}
              >
                {s.notify_on_match ? <Bell className="size-3.5" /> : <BellOff className="size-3.5 text-muted-foreground" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-6"
                aria-label="Delete search"
                onClick={() => deleteJobSearch(s.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New saved search</DialogTitle>
            <DialogDescription>Name a set of criteria so you can reuse it, e.g. &ldquo;Frontend — Remote&rdquo;.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="js-name">Name</Label>
              <Input id="js-name" name="name" required autoFocus placeholder="Data Analyst — Remote" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="js-titles">Titles</Label>
              <Input id="js-titles" name="titles" placeholder="Data Analyst, BI Analyst" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="js-keywords">Keywords</Label>
              <Input id="js-keywords" name="keywords" placeholder="SQL, dashboards" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="js-locations">Locations</Label>
              <Input id="js-locations" name="locations" placeholder="Remote, Manila" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="js-salary">Minimum salary</Label>
              <Input id="js-salary" name="minSalary" type="number" min={0} />
            </div>
            <label className="flex items-center justify-between gap-4 rounded-md border border-border p-3 text-sm">
              <span>
                Notify on match
                <p className="text-xs font-normal text-muted-foreground">
                  Requires a connected job source (Settings → Integrations) to have anything to alert on.
                </p>
              </span>
              <Switch name="notifyOnMatch" />
            </label>
            <input type="hidden" name="remoteOk" value="on" />
            <input type="hidden" name="hybridOk" value="on" />
            <input type="hidden" name="onsiteOk" value="on" />
            <input type="hidden" name="employmentTypes" value="full_time" />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Save search
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
