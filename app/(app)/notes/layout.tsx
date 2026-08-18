import { SubNav } from "@/components/shared/sub-nav";

const NAV = [
  { label: "All Notes", href: "/notes" },
  { label: "Journal", href: "/notes/journal" },
  { label: "Snippets", href: "/notes/snippets" },
  { label: "Ideas", href: "/notes/ideas" },
  { label: "Bookmarks", href: "/notes/bookmarks" },
];

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Notes</h1>
        <p className="text-sm text-muted-foreground">Your second brain — notes, snippets, ideas, and links.</p>
      </div>
      <SubNav items={NAV} />
      {children}
    </div>
  );
}
