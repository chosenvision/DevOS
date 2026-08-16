"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { SkillCard } from "@/components/learning/skill-card";
import { createSkill } from "@/services/actions/learning";
import { SKILL_LEVEL_LABEL, SKILL_LEVEL_ORDER } from "@/lib/constants";
import type { Skill } from "@/types/database";

export function SkillsPageClient({ skills }: { skills: Skill[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <EmptyState
          title="No skills tracked yet."
          description="Add the technologies you're learning or already know."
          actionLabel="Add skill"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add skill</DialogTitle>
            <DialogDescription>Track your current level in a technology.</DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              const res = await createSkill(formData);
              if (res.error) toast.error(res.error);
              else setOpen(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="sk-name">Skill</Label>
              <Input id="sk-name" name="name" required autoFocus placeholder="TypeScript" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sk-category">Category</Label>
                <Input id="sk-category" name="category" placeholder="Frontend" />
              </div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select name="level" defaultValue="learning">
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVEL_ORDER.map((l) => (
                      <SelectItem key={l} value={l}>{SKILL_LEVEL_LABEL[l]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full">Add skill</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
