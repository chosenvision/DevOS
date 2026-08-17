"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createJobListing } from "@/services/actions/career";
import { EMPLOYMENT_TYPE_LABEL } from "@/lib/constants";

export function JobListingFormDialog() {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();

  async function formAction(formData: FormData) {
    const res = await createJobListing({}, formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(undefined);
    toast.success(res.success);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add a job
      </Button>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a job</DialogTitle>
          <DialogDescription>
            Paste a listing you found — DevOS will score it against your Career Profile.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="jl-title">Title</Label>
              <Input id="jl-title" name="title" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jl-company">Company</Label>
              <Input id="jl-company" name="companyName" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="jl-location">Location</Label>
              <Input id="jl-location" name="location" />
            </div>
            <div className="space-y-1.5">
              <Label>Work setup</Label>
              <Select name="workMode" defaultValue="remote">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select name="employmentType" defaultValue="full_time">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jl-min">Salary min</Label>
              <Input id="jl-min" name="salaryMin" type="number" min={0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jl-max">Salary max</Label>
              <Input id="jl-max" name="salaryMax" type="number" min={0} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jl-url">Job URL</Label>
            <Input id="jl-url" name="url" type="url" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="jl-source">Source</Label>
              <Input id="jl-source" name="source" placeholder="LinkedIn, referral, company site..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jl-posted">Posted date</Label>
              <Input id="jl-posted" name="postedDate" type="date" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jl-skills">Skills requested</Label>
            <Input id="jl-skills" name="skills" placeholder="SQL, Power BI, Python" />
            <p className="text-xs text-muted-foreground">Comma-separated — this drives the skills portion of your match score.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jl-description">Job description</Label>
            <Textarea id="jl-description" name="description" rows={5} placeholder="Paste the full listing here" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Save & score job
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
