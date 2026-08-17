import { SubNav } from "@/components/shared/sub-nav";

const NAV = [
  { label: "Applications", href: "/career/applications" },
  { label: "Resume", href: "/career/resume" },
  { label: "Interview Prep", href: "/career/interview-prep" },
  { label: "Coding Practice", href: "/career/coding-practice" },
  { label: "Companies", href: "/career/companies" },
  { label: "Contacts", href: "/career/contacts" },
];

export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Career Hub</h1>
        <p className="text-sm text-muted-foreground">Run your job search like a project.</p>
      </div>
      <SubNav items={NAV} />
      {children}
    </div>
  );
}
