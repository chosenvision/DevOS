import { SubNav } from "@/components/shared/sub-nav";

const NAV = [
  { label: "Overview", href: "/learning" },
  { label: "Courses", href: "/learning/courses" },
  { label: "Skills", href: "/learning/skills" },
  { label: "Roadmap", href: "/learning/roadmap" },
  { label: "Resources", href: "/learning/resources" },
  { label: "Certifications", href: "/learning/certifications" },
];

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Learning Hub</h1>
        <p className="text-sm text-muted-foreground">Courses, skills, and the roadmap that connects them.</p>
      </div>
      <SubNav items={NAV} />
      {children}
    </div>
  );
}
