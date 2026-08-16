import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, ExternalLink, GitBranch, MapPin } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getPublicPortfolio } from "@/services/queries/portfolio";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/portfolio/[username]">): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username} — Portfolio` };
}

export default async function PublicPortfolioPage({ params }: PageProps<"/portfolio/[username]">) {
  const { username } = await params;
  const supabase = await createClient();
  const result = await getPublicPortfolio(supabase, username);

  if (!result) notFound();

  const { profile, projects } = result;

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12 flex items-start gap-5">
          <Avatar className="size-16">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-lg">{initials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{profile.full_name}</h1>
            {profile.role && <p className="text-muted-foreground">{profile.role}</p>}
            {profile.location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" /> {profile.location}
              </p>
            )}
            {profile.bio && <p className="mt-3 max-w-xl text-sm text-muted-foreground">{profile.bio}</p>}
            <div className="mt-3 flex gap-3 text-sm">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <GitBranch className="size-3.5" /> GitHub
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  LinkedIn
                </a>
              )}
              {profile.website_url && (
                <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  Website
                </a>
              )}
            </div>
          </div>
        </header>

        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No published projects yet.</p>
        ) : (
          <div className="space-y-8">
            {projects.map((project) => (
              <article key={project.id} className="rounded-lg border border-border p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">{project.title}</h2>
                  {project.is_featured && <Badge>Featured</Badge>}
                </div>
                {project.description && <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>}

                {(project.problem || project.solution || project.outcome) && (
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    {project.problem && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Problem</p>
                        <p className="mt-1">{project.problem}</p>
                      </div>
                    )}
                    {project.solution && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Solution</p>
                        <p className="mt-1">{project.solution}</p>
                      </div>
                    )}
                    {project.outcome && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Outcome</p>
                        <p className="mt-1">{project.outcome}</p>
                      </div>
                    )}
                  </div>
                )}

                {project.tech_stack.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.tech_stack.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-4">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                      <GitBranch className="size-3.5" /> Repository <ArrowUpRight className="size-3" />
                    </a>
                  )}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                      <ExternalLink className="size-3.5" /> Live demo
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Built with DevOS
        </footer>
      </div>
    </div>
  );
}
