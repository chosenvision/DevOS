import Link from "next/link";
import { Terminal, CheckCircle2 } from "lucide-react";

const HIGHLIGHTS = [
  "Track every project, task, and deadline in one command center",
  "See coding hours, streaks, and GitHub activity at a glance",
  "Run your job search — applications, interviews, and follow-ups",
  "Keep learning roadmaps, notes, and snippets in the same place",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-between border-r border-border bg-sidebar p-10 max-lg:hidden">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Terminal className="size-4" />
          </span>
          DevOS
        </Link>
        <div className="max-w-sm space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-balance">
            The operating system for your developer journey.
          </h2>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Built for students, freelancers, and job seekers who want one place to run their craft.
        </p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
