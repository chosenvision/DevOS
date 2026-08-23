"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error("DevOS app error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="max-w-md items-center gap-4 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <div className="space-y-1 px-6">
          <p className="text-sm font-medium">Something went wrong.</p>
          <p className="text-sm text-muted-foreground">
            This page hit an unexpected error. It&apos;s been logged — try again, or head back to your dashboard.
          </p>
          {error.digest && <p className="pt-1 font-mono text-[11px] text-muted-foreground/70">Ref: {error.digest}</p>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="size-3.5" /> Try again
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
