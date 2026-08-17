import { SubNav } from "@/components/shared/sub-nav";

const NAV = [
  { label: "Overview", href: "/career" },
  { label: "Job Search", href: "/career/job-search" },
  { label: "Applications", href: "/career/applications" },
  { label: "Career Inbox", href: "/career/inbox" },
  { label: "Interviews", href: "/career/interviews" },
  { label: "Resume Studio", href: "/career/resume" },
  { label: "Recruiters", href: "/career/contacts" },
  { label: "Companies", href: "/career/companies" },
  { label: "Assessments", href: "/career/assessments" },
  { label: "Career Analytics", href: "/career/analytics" },
  { label: "Interview Prep", href: "/career/interview-prep" },
  { label: "Coding Practice", href: "/career/coding-practice" },
];

export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Career Hub</h1>
        <p className="text-sm text-muted-foreground">Your AI-assisted career agent — job search, applications, and interview prep in one place.</p>
      </div>
      <SubNav items={NAV} />
      {children}
    </div>
  );
}
