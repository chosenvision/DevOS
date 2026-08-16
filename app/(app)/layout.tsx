import { requireUser } from "@/services/auth";
import { getProjectOptions } from "@/services/queries/projects";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, projects] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single(),
    getProjectOptions(supabase, user.id),
  ]);

  return (
    <AppShell
      name={profile?.full_name || user.email?.split("@")[0] || "there"}
      email={user.email ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
      projects={projects}
    >
      {children}
    </AppShell>
  );
}
