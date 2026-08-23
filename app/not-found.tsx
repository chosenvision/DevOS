import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloatingOrbs } from "@/components/shared/floating-orbs";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-glow bg-dot-grid p-6 text-center">
      <FloatingOrbs />
      <div className="relative flex flex-col items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Compass className="size-5" />
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            That page doesn&apos;t exist, or you don&apos;t have access to it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
