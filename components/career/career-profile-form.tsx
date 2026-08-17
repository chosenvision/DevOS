"use client";

import * as React from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertCareerProfile } from "@/services/actions/career";
import { EMPLOYMENT_TYPE_LABEL } from "@/lib/constants";
import type { CareerProfile, EmploymentType, Resume } from "@/types/database";

const EMPLOYMENT_TYPES = Object.keys(EMPLOYMENT_TYPE_LABEL) as EmploymentType[];

function toCsv(values: string[] | undefined) {
  return (values ?? []).join(", ");
}

export function CareerProfileForm({ profile, resumes }: { profile: CareerProfile | null; resumes: Resume[] }) {
  const [values, setValues] = React.useState({
    professionalSummary: profile?.professional_summary ?? "",
    yearsExperience: profile?.years_experience != null ? String(profile.years_experience) : "",
    skills: toCsv(profile?.skills),
    preferredRoles: toCsv(profile?.preferred_roles),
    preferredIndustries: toCsv(profile?.preferred_industries),
    preferredLocations: toCsv(profile?.preferred_locations),
    excludedCompanies: toCsv(profile?.excluded_companies),
    excludedKeywords: toCsv(profile?.excluded_keywords),
    remoteOk: profile?.remote_ok ?? true,
    hybridOk: profile?.hybrid_ok ?? true,
    onsiteOk: profile?.onsite_ok ?? true,
    employmentTypes: profile?.employment_types ?? (["full_time"] as EmploymentType[]),
    minSalary: profile?.min_salary != null ? String(profile.min_salary) : "",
    targetSalary: profile?.target_salary != null ? String(profile.target_salary) : "",
    noticePeriod: profile?.notice_period ?? "",
    workAuthorization: profile?.work_authorization ?? "",
    primaryResumeId: profile?.primary_resume_id ?? "",
  });
  const [pending, startTransition] = React.useTransition();

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleEmploymentType(type: EmploymentType, checked: boolean) {
    setValues((v) => ({
      ...v,
      employmentTypes: checked ? [...v.employmentTypes, type] : v.employmentTypes.filter((t) => t !== type),
    }));
  }

  function handleSave() {
    const fd = new FormData();
    fd.set("professionalSummary", values.professionalSummary);
    fd.set("yearsExperience", values.yearsExperience);
    fd.set("skills", values.skills);
    fd.set("preferredRoles", values.preferredRoles);
    fd.set("preferredIndustries", values.preferredIndustries);
    fd.set("preferredLocations", values.preferredLocations);
    fd.set("excludedCompanies", values.excludedCompanies);
    fd.set("excludedKeywords", values.excludedKeywords);
    if (values.remoteOk) fd.set("remoteOk", "on");
    if (values.hybridOk) fd.set("hybridOk", "on");
    if (values.onsiteOk) fd.set("onsiteOk", "on");
    for (const t of values.employmentTypes) fd.append("employmentTypes", t);
    fd.set("minSalary", values.minSalary);
    fd.set("targetSalary", values.targetSalary);
    fd.set("noticePeriod", values.noticePeriod);
    fd.set("workAuthorization", values.workAuthorization);
    fd.set("primaryResumeId", values.primaryResumeId);

    startTransition(async () => {
      const res = await upsertCareerProfile({}, fd);
      if (res.error) toast.error(res.error);
      else toast.success(res.success ?? "Saved.");
    });
  }

  return (
    <div className="space-y-4">
      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Profile & Skills</CardTitle>
          <CardDescription>
            The source of truth the Job Match engine compares every job against. Detailed work history and
            education live on your resumes — manage those in Resume Studio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="summary">Professional summary</Label>
            <Textarea
              id="summary"
              rows={3}
              value={values.professionalSummary}
              onChange={(e) => set("professionalSummary", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="years">Years of experience</Label>
              <Input
                id="years"
                type="number"
                min={0}
                step={0.5}
                value={values.yearsExperience}
                onChange={(e) => set("yearsExperience", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="primaryResume">Primary resume</Label>
              <Select value={values.primaryResumeId || "none"} onValueChange={(v) => set("primaryResumeId", v === "none" ? "" : v)}>
                <SelectTrigger id="primaryResume" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None selected</SelectItem>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              placeholder="SQL, Python, Tableau, Stakeholder management"
              value={values.skills}
              onChange={(e) => set("skills", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Comma-separated. Compared directly against skills requested in job listings.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Job Preferences</CardTitle>
          <CardDescription>Used for matching and to power saved searches.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="roles">Preferred roles</Label>
              <Input id="roles" placeholder="Data Analyst, Systems Analyst" value={values.preferredRoles} onChange={(e) => set("preferredRoles", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industries">Preferred industries</Label>
              <Input id="industries" placeholder="Fintech, SaaS" value={values.preferredIndustries} onChange={(e) => set("preferredIndustries", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="locations">Preferred locations</Label>
            <Input id="locations" placeholder="Manila, Cebu" value={values.preferredLocations} onChange={(e) => set("preferredLocations", e.target.value)} />
            <p className="text-xs text-muted-foreground">Used for on-site roles only — remote/hybrid preference is set below.</p>
          </div>

          <div className="space-y-2">
            <Label>Work setup</Label>
            <div className="flex flex-wrap gap-4">
              {[
                { key: "remoteOk" as const, label: "Remote" },
                { key: "hybridOk" as const, label: "Hybrid" },
                { key: "onsiteOk" as const, label: "On-site" },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-sm">
                  <Switch checked={values[opt.key]} onCheckedChange={(c) => set(opt.key, c)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Employment type</Label>
            <div className="flex flex-wrap gap-4">
              {EMPLOYMENT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={values.employmentTypes.includes(type)}
                    onCheckedChange={(c) => toggleEmploymentType(type, c === true)}
                  />
                  {EMPLOYMENT_TYPE_LABEL[type]}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="excludedCompanies">Excluded companies</Label>
              <Input id="excludedCompanies" placeholder="Companies you never want to see" value={values.excludedCompanies} onChange={(e) => set("excludedCompanies", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="excludedKeywords">Excluded keywords</Label>
              <Input id="excludedKeywords" placeholder="e.g. unpaid, commission-only" value={values.excludedKeywords} onChange={(e) => set("excludedKeywords", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Compensation & Logistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="minSalary">Minimum salary</Label>
              <Input id="minSalary" type="number" min={0} value={values.minSalary} onChange={(e) => set("minSalary", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetSalary">Target salary</Label>
              <Input id="targetSalary" type="number" min={0} value={values.targetSalary} onChange={(e) => set("targetSalary", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="notice">Notice period</Label>
              <Input id="notice" placeholder="2 weeks, Immediate" value={values.noticePeriod} onChange={(e) => set("noticePeriod", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workAuth">Work authorization</Label>
              <Input id="workAuth" placeholder="e.g. Authorized to work in the PH" value={values.workAuthorization} onChange={(e) => set("workAuthorization", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={pending}>
        {pending ? "Saving..." : "Save career profile"}
      </Button>
    </div>
  );
}
