-- Real GitHub sync: github_connections.access_token_encrypted and
-- github_repos already existed but were never populated — nothing in the
-- app requested repo-scope access or captured the OAuth token. This adds
-- the one missing piece of state (a cached weekly commit-activity summary)
-- so the Dashboard's "GitHub Commits" card doesn't need to hit the GitHub
-- API on every page load.

alter table public.github_connections
  add column if not exists recent_commits jsonb not null default '[]'::jsonb;

comment on column public.github_connections.recent_commits is
  'Array of {date, count} for the last 14 days, computed from the GitHub Events API at sync time — not a live query.';

-- Lets sync upsert on (user_id, full_name) instead of delete+reinsert, so
-- is_linked/project_id (set by the user, not by sync) survive a re-sync.
alter table public.github_repos
  add constraint github_repos_user_full_name_key unique (user_id, full_name);
