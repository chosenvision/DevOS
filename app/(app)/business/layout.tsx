import { SubNav } from "@/components/shared/sub-nav";

const NAV = [
  { label: "Overview", href: "/business" },
  { label: "Team", href: "/business/team" },
];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Business</h1>
        <p className="text-sm text-muted-foreground">
          Run the business side of your work — clients, deals, invoicing, and your team, in one place.
        </p>
      </div>
      <SubNav items={NAV} />
      {children}
    </div>
  );
}
