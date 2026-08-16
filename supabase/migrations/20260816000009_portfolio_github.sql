-- Portfolio manager + GitHub integration cache.

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  description text,
  images text[] not null default '{}',
  tech_stack text[] not null default '{}',
  role text,
  problem text,
  solution text,
  outcome text,
  github_url text,
  live_url text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index portfolio_projects_user_idx on public.portfolio_projects (user_id, is_published, sort_order);

alter table public.portfolio_projects enable row level security;

create policy "Users manage own portfolio projects"
  on public.portfolio_projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Published portfolio projects are publicly viewable"
  on public.portfolio_projects for select
  using (is_published = true);

create trigger portfolio_projects_set_updated_at
  before update on public.portfolio_projects
  for each row execute function public.set_updated_at();

create table public.github_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  github_username text not null,
  access_token_encrypted text,
  avatar_url text,
  public_repos integer,
  followers integer,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz
);

alter table public.github_connections enable row level security;

create policy "Users manage own GitHub connection"
  on public.github_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.github_repos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  repo_name text not null,
  full_name text not null,
  description text,
  stars integer not null default 0,
  forks integer not null default 0,
  language text,
  url text not null,
  is_linked boolean not null default false,
  synced_at timestamptz not null default now()
);

create index github_repos_user_idx on public.github_repos (user_id);

alter table public.github_repos enable row level security;

create policy "Users manage own GitHub repo cache"
  on public.github_repos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
