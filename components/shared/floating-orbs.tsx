import { cn } from "@/lib/utils";

/**
 * Ambient drifting gradient blobs for hero surfaces. Pure CSS (no JS, no
 * client boundary) — transform-only keyframes so they're free to render.
 */
export function FloatingOrbs({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="animate-float-a absolute -top-16 left-[15%] size-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="animate-float-b absolute top-4 right-[10%] size-64 rounded-full bg-[oklch(0.75_0.14_190)]/20 blur-3xl" />
      <div className="animate-float-a absolute bottom-[-4rem] left-[40%] size-56 rounded-full bg-[oklch(0.78_0.15_75)]/15 blur-3xl [animation-delay:-6s]" />
    </div>
  );
}
