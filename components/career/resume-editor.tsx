"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Wand2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateResumeContent, generateResumeFromData } from "@/services/actions/resumes";
import type { Resume, ResumeContent } from "@/types/database";

export function ResumeEditor({ resume }: { resume: Resume }) {
  const [content, setContent] = React.useState<ResumeContent>(resume.content ?? {});
  const [atsMode, setAtsMode] = React.useState(resume.is_ats_mode);
  const [portfolioMode, setPortfolioMode] = React.useState(resume.is_portfolio_mode);
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await updateResumeContent(resume.id, content, { atsMode, portfolioMode });
    setSaving(false);
    if (res.error) toast.error(res.error);
    else toast.success("Resume saved.");
  }

  async function handleGenerate() {
    const res = await generateResumeFromData(resume.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Pulled in your projects, skills, and certifications.");
      window.location.reload();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={atsMode} onCheckedChange={setAtsMode} />
            ATS-friendly mode
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={portfolioMode} onCheckedChange={setPortfolioMode} />
            Portfolio mode
          </label>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate}>
            <Wand2 className="size-3.5" /> Generate from DevOS data
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card className="py-4">
        <CardHeader><CardTitle className="text-sm">Personal information</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input
              value={content.personal?.name ?? ""}
              onChange={(e) => setContent({ ...content, personal: { ...content.personal, name: e.target.value } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={content.personal?.email ?? ""}
              onChange={(e) => setContent({ ...content, personal: { ...content.personal, email: e.target.value } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={content.personal?.phone ?? ""}
              onChange={(e) => setContent({ ...content, personal: { ...content.personal, phone: e.target.value } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input
              value={content.personal?.location ?? ""}
              onChange={(e) => setContent({ ...content, personal: { ...content.personal, location: e.target.value } })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            value={content.summary ?? ""}
            onChange={(e) => setContent({ ...content, summary: e.target.value })}
            placeholder="A short pitch — who you are and what you build."
          />
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Experience</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setContent({
                ...content,
                experience: [...(content.experience ?? []), { company: "", title: "", bullets: [] }],
              })
            }
          >
            <Plus className="size-3.5" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(content.experience ?? []).map((exp, i) => (
            <div key={i} className="space-y-2 rounded-md border border-border p-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => {
                    const next = [...(content.experience ?? [])];
                    next[i] = { ...next[i], company: e.target.value };
                    setContent({ ...content, experience: next });
                  }}
                />
                <Input
                  placeholder="Title"
                  value={exp.title}
                  onChange={(e) => {
                    const next = [...(content.experience ?? [])];
                    next[i] = { ...next[i], title: e.target.value };
                    setContent({ ...content, experience: next });
                  }}
                />
              </div>
              <Textarea
                placeholder="One bullet point per line"
                rows={3}
                value={exp.bullets.join("\n")}
                onChange={(e) => {
                  const next = [...(content.experience ?? [])];
                  next[i] = { ...next[i], bullets: e.target.value.split("\n") };
                  setContent({ ...content, experience: next });
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => setContent({ ...content, experience: (content.experience ?? []).filter((_, idx) => idx !== i) })}
              >
                <Trash2 className="size-3.5" /> Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Education</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setContent({ ...content, education: [...(content.education ?? []), { school: "", degree: "" }] })}
          >
            <Plus className="size-3.5" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(content.education ?? []).map((ed, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-md border border-border p-3">
              <Input
                placeholder="School"
                value={ed.school}
                onChange={(e) => {
                  const next = [...(content.education ?? [])];
                  next[i] = { ...next[i], school: e.target.value };
                  setContent({ ...content, education: next });
                }}
              />
              <Input
                placeholder="Degree"
                value={ed.degree}
                onChange={(e) => {
                  const next = [...(content.education ?? [])];
                  next[i] = { ...next[i], degree: e.target.value };
                  setContent({ ...content, education: next });
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="col-span-2 justify-self-start text-destructive"
                onClick={() => setContent({ ...content, education: (content.education ?? []).filter((_, idx) => idx !== i) })}
              >
                <Trash2 className="size-3.5" /> Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader><CardTitle className="text-sm">Projects</CardTitle></CardHeader>
        <CardContent>
          {(content.projects ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects yet — use &ldquo;Generate from DevOS data&rdquo; to pull in your recent projects.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(content.projects ?? []).map((p, i) => (
                <li key={i} className="rounded-md border border-border p-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                  {p.tech && p.tech.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">{p.tech.join(", ")}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader><CardTitle className="text-sm">Skills</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            rows={2}
            value={(content.skills ?? []).join(", ")}
            onChange={(e) => setContent({ ...content, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            placeholder="React, TypeScript, Supabase..."
          />
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader><CardTitle className="text-sm">Certifications & achievements</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Certifications (one per line)</Label>
            <Textarea
              rows={3}
              value={(content.certifications ?? []).join("\n")}
              onChange={(e) => setContent({ ...content, certifications: e.target.value.split("\n").filter(Boolean) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Achievements (one per line)</Label>
            <Textarea
              rows={3}
              value={(content.achievements ?? []).join("\n")}
              onChange={(e) => setContent({ ...content, achievements: e.target.value.split("\n").filter(Boolean) })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save resume"}
        </Button>
      </div>
    </div>
  );
}
