"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateSkillLevel, deleteSkill } from "@/services/actions/learning";
import { SKILL_LEVEL_LABEL, SKILL_LEVEL_ORDER } from "@/lib/constants";
import type { Skill } from "@/types/database";

const LEVEL_WIDTH: Record<string, string> = {
  learning: "20%",
  beginner: "40%",
  intermediate: "60%",
  advanced: "80%",
  confident: "100%",
};

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Card className="gap-2 py-3">
      <div className="flex items-center justify-between px-4">
        <div>
          <p className="text-sm font-medium">{skill.name}</p>
          {skill.category && <p className="text-xs text-muted-foreground">{skill.category}</p>}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
          onClick={async () => {
            const res = await deleteSkill(skill.id);
            if (res.error) toast.error(res.error);
          }}
          aria-label="Remove skill"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <div className="px-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: LEVEL_WIDTH[skill.level] }} />
        </div>
      </div>
      <div className="flex items-center justify-between px-4">
        <Select
          value={skill.level}
          onValueChange={async (level) => {
            const res = await updateSkillLevel(skill.id, level);
            if (res.error) toast.error(res.error);
          }}
        >
          <SelectTrigger size="sm" className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SKILL_LEVEL_ORDER.map((l) => (
              <SelectItem key={l} value={l}>{SKILL_LEVEL_LABEL[l]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {skill.hours_practiced > 0 && (
          <span className="text-xs text-muted-foreground">{skill.hours_practiced}h practiced</span>
        )}
      </div>
    </Card>
  );
}
