import { requireUser } from "@/services/auth";
import { getOrCreateProfile } from "@/services/queries/profile";
import { getProjectOptions } from "@/services/queries/projects";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();

  const [profile, projects] = await Promise.all([
    getOrCreateProfile(supabase, user.id, user.email),
    getProjectOptions(supabase, user.id),
  ]);

  return (
    <AppShell
      name={profile.full_name || user.email?.split("@")[0] || "there"}
      email={user.email ?? ""}
      avatarUrl={profile.avatar_url}
      projects={projects}
    >
      {children}
    </AppShell>
  );
}
