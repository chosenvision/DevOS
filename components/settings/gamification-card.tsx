import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Achievement } from "@/types/database";

const XP_PER_LEVEL = 200;

function iconFor(name: string | null): LucideIcon {
  if (!name) return Icons.Award;
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? Icons.Award;
}

export function GamificationCard({
  xp,
  level,
  unlockedKeys,
  achievements,
}: {
  xp: number;
  level: number;
  unlockedKeys: Set<string>;
  achievements: Achievement[];
}) {
  const xpIntoLevel = xp % XP_PER_LEVEL;

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">Progress & achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Level {level}</span>
            <span className="text-muted-foreground">{xpIntoLevel} / {XP_PER_LEVEL} XP</span>
          </div>
          <Progress value={(xpIntoLevel / XP_PER_LEVEL) * 100} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {achievements.map((a) => {
            const unlocked = unlockedKeys.has(a.key);
            const Icon = iconFor(a.icon);
            return (
              <div
                key={a.key}
                title={a.description}
                className={`flex flex-col items-center gap-1.5 rounded-md border p-3 text-center ${
                  unlocked ? "border-primary/30 bg-primary/5" : "border-border opacity-40"
                }`}
              >
                <Icon className={unlocked ? "size-5 text-primary" : "size-5 text-muted-foreground"} />
                <span className="text-[11px] font-medium">{a.title}</span>
                {unlocked && <Badge variant="secondary" className="text-[10px]">+{a.xp_reward} XP</Badge>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
