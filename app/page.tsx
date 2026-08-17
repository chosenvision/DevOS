import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Terminal,
  FolderKanban,
  CheckSquare,
  GraduationCap,
  Briefcase,
  BarChart3,
  Timer,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { TONE_CLASSES, type Tone } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FEATURES: { icon: typeof FolderKanban; title: string; description: string; tone: Tone }[] = [
  {
    icon: FolderKanban,
    title: "Projects",
    description: "Plan, build, and ship — with milestones, bugs, and activity tracked per project.",
    tone: "primary",
  },
  {
    icon: CheckSquare,
    title: "Tasks & focus",
    description: "Today, upcoming, and kanban views, plus a distraction-free focus mode.",
    tone: "warning",
  },
  {
    icon: Timer,
    title: "Time tracking",
    description: "Start a timer or log time manually against any project, task, or study session.",
    tone: "success",
  },
  {
    icon: GraduationCap,
    title: "Learning hub",
    description: "Courses, skills, and roadmaps — see exactly what to learn next.",
    tone: "accent",
  },
  {
    icon: Briefcase,
    title: "Career hub",
    description: "Run your job search: applications, interviews, and coding practice.",
    tone: "destructive",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Coding hours, streaks, and productivity trends backed by real data.",
    tone: "primary",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
              <Terminal className="size-4" />
            </span>
            DevOS
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-glow bg-dot-grid">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
              <Sparkles className="size-3.5 text-primary" />
              Built for developers who ship
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              The operating system for your developer journey.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-balance">
              Projects, tasks, learning, career, and coding activity — one command center that answers
              &ldquo;what should I work on today?&rdquo;
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/sign-up">
                  Start building for free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight">Everything in one place</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Stop juggling a dozen tabs. DevOS brings the whole developer workflow under one roof.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft-lg"
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105",
                      TONE_CLASSES[feature.tone]
                    )}
                  >
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 py-16 text-center sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Ready to run your developer life like a product?
            </h2>
            <p className="max-w-lg text-sm text-muted-foreground">
              Free to start. Bring your own Supabase project and own your data end to end.
            </p>
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Start building for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} DevOS</span>
          <span>Built for developers who ship.</span>
        </div>
      </footer>
    </div>
  );
}
