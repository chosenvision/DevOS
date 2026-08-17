-- LinkedIn identity connection (Sign in with LinkedIn via Supabase's
-- `linkedin_oidc` provider). Mirrors github_connections exactly.
--
-- Scope limit, by design of LinkedIn's own OIDC API: this captures name,
-- email, and profile photo only. LinkedIn does not expose job listings,
-- connections, messages, or feed data to third-party apps outside its
-- restricted partner program — see ARCHITECTURE.md "Career Agent" for why
-- live job data instead comes from a separate job-board source.

create table public.linkedin_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  linkedin_name text not null,
  linkedin_email text,
  avatar_url text,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz
);

alter table public.linkedin_connections enable row level security;

create policy "Users manage own LinkedIn connection"
  on public.linkedin_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
