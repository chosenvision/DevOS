"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Laptop, Moon, Sun } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">Theme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-sm transition-colors hover:border-primary/40",
                mounted && theme === option.value && "border-primary bg-primary/5"
              )}
            >
              {mounted && theme === option.value && (
                <Check className="absolute top-2 right-2 size-3.5 text-primary" />
              )}
              <option.icon className="size-5" />
              {option.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
