import { Star, GitFork } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GithubRepo } from "@/types/database";

export function GithubRepoList({ repos }: { repos: GithubRepo[] }) {
  if (repos.length === 0) return null;

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">Synced repositories</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 hover:opacity-80"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{repo.repo_name}</p>
              {repo.description && <p className="truncate text-xs text-muted-foreground">{repo.description}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
              <span className="inline-flex items-center gap-1">
                <Star className="size-3" /> {repo.stars}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork className="size-3" /> {repo.forks}
              </span>
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
