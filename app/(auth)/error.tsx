"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error("DevOS auth error:", error);
  }, [error]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium">Something went wrong.</p>
        <p className="text-sm text-muted-foreground">This page hit an unexpected error — try again, or head back to sign in.</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="size-3.5" /> Try again
        </Button>
        <Button size="sm" asChild>
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
