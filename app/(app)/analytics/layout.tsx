import { SubNav } from "@/components/shared/sub-nav";

const NAV = [
  { label: "Overview", href: "/analytics" },
  { label: "Habits", href: "/analytics/habits" },
  { label: "Goals", href: "/analytics/goals" },
];

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">How your time, consistency, and progress are trending.</p>
      </div>
      <SubNav items={NAV} />
      {children}
    </div>
  );
}
