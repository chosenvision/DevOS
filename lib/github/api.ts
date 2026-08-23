/**
 * Server-only GitHub REST API client. Uses the user's own OAuth token
 * (captured when they connect GitHub with `public_repo` scope — see
 * app/auth/callback/route.ts) — never a shared app-level credential.
 */

const GITHUB_API = "https://api.github.com";

export interface GithubUser {
  login: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
}

export interface GithubRepoSummary {
  repo_name: string;
  full_name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  url: string;
}

export interface CommitDay {
  date: string;
  count: number;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function fetchGithubUser(token: string): Promise<GithubUser> {
  const res = await fetch(`${GITHUB_API}/user`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`GitHub API error fetching user (HTTP ${res.status}).`);
  const json = await res.json();
  return {
    login: json.login,
    avatar_url: json.avatar_url,
    public_repos: json.public_repos ?? 0,
    followers: json.followers ?? 0,
  };
}

export async function fetchGithubRepos(token: string, limit = 30): Promise<GithubRepoSummary[]> {
  const res = await fetch(`${GITHUB_API}/user/repos?sort=pushed&per_page=${limit}&affiliation=owner`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`GitHub API error fetching repos (HTTP ${res.status}).`);
  const json = await res.json();
  if (!Array.isArray(json)) return [];

  return json.map((r) => ({
    repo_name: r.name,
    full_name: r.full_name,
    description: r.description ?? null,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    language: r.language ?? null,
    url: r.html_url,
  }));
}

/**
 * Daily push-commit counts for the last 14 days, from the GitHub Events
 * API. This is activity DevOS can see (public pushes, plus private ones
 * if the token's org/repo access allows it) within GitHub's ~90-day event
 * retention — not a full commit-history query, which would need a
 * separate API call per repo and isn't worth the rate-limit cost for a
 * dashboard summary card.
 */
export async function fetchRecentCommitActivity(token: string, username: string): Promise<CommitDay[]> {
  const res = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}/events?per_page=100`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`GitHub API error fetching activity (HTTP ${res.status}).`);
  const events = await res.json();
  if (!Array.isArray(events)) return [];

  const since = new Date();
  since.setDate(since.getDate() - 14);

  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.type !== "PushEvent") continue;
    const createdAt = new Date(event.created_at);
    if (createdAt < since) continue;
    const day = createdAt.toISOString().slice(0, 10);
    const commitCount = Array.isArray(event.payload?.commits) ? event.payload.commits.length : 1;
    counts.set(day, (counts.get(day) ?? 0) + commitCount);
  }

  return [...counts.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
}
