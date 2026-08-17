import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic route-loading fallback. Rendered instantly by Next.js the moment a
 * navigation starts (via the nearest `loading.tsx` Suspense boundary), so it
 * only needs to roughly match a page's shape — it's on screen for a beat,
 * not long enough for pixel-perfect fidelity to matter.
 */
export function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Card key={i} className="gap-3 py-4">
            <div className="flex items-center justify-between px-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <div className="px-5">
              <Skeleton className="h-7 w-16" />
            </div>
            <div className="px-5">
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
