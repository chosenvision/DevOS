"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CSV_EXPORTS = [
  { type: "tasks", label: "Tasks" },
  { type: "projects", label: "Projects" },
  { type: "applications", label: "Applications" },
  { type: "learning", label: "Learning data" },
  { type: "time-tracking", label: "Time tracking" },
];

export function DataForm() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [importing, setImporting] = React.useState(false);

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Import failed.");
      } else {
        const restored = Object.values(json.summary as Record<string, number>).reduce((a, b) => a + b, 0);
        toast.success(`Restored ${restored} records. Refresh to see them.`);
      }
    } catch {
      toast.error("Could not read that file.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Export CSV</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {CSV_EXPORTS.map((e) => (
            <Button key={e.type} variant="outline" size="sm" asChild>
              <a href={`/api/export/${e.type}`} download>
                <Download className="size-3.5" /> {e.label}
              </a>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-sm">Full account backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Export everything as JSON, or restore from a previous backup.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/api/export/backup" download>
                <Download className="size-3.5" /> Export full backup (JSON)
              </a>
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
            <Button variant="outline" size="sm" disabled={importing} onClick={() => inputRef.current?.click()}>
              <Upload className="size-3.5" /> {importing ? "Importing..." : "Import backup"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Import restores your standalone records (projects, tasks, notes, and more). Cross-references
            between them — like a task&apos;s linked project — aren&apos;t restored automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
