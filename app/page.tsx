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
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: FolderKanban,
    title: "Projects",
    description: "Plan, build, and ship — with milestones, bugs, and activity tracked per project.",
  },
  {
    icon: CheckSquare,
    title: "Tasks & focus",
    description: "Today, upcoming, and kanban views, plus a distraction-free focus mode.",
  },
  {
    icon: Timer,
    title: "Time tracking",
    description: "Start a timer or log time manually against any project, task, or study session.",
  },
  {
    icon: GraduationCap,
    title: "Learning hub",
    description: "Courses, skills, and roadmaps — see exactly what to learn next.",
  },
  {
    icon: Briefcase,
    title: "Career hub",
    description: "Run your job search: applications, interviews, and coding practice.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Coding hours, streaks, and productivity trends backed by real data.",
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
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
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
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            The operating system for your developer journey.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-balance">
            Projects, tasks, learning, career, and coding activity — one command center that answers
            &ldquo;what should I work on today?&rdquo;
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Start building for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto grid max-w-6xl gap-px px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3 rounded-lg bg-background p-6">
                <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <feature.icon className="size-4.5" />
                </span>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
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
