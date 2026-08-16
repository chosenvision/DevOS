-- Projects module: projects, milestones, files, bugs.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  status project_status not null default 'idea',
  priority project_priority not null default 'medium',
  category text,
  is_client_project boolean not null default false,
  client_name text,
  start_date date,
  deadline date,
  progress smallint not null default 0 check (progress between 0 and 100),
  tech_stack text[] not null default '{}',
  repo_url text,
  live_url text,
  cover_image_url text,
  notes text,
  goals text,
  is_archived boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index projects_user_idx on public.projects (user_id, is_archived, status);
create index projects_deadline_idx on public.projects (user_id, deadline);

alter table public.projects enable row level security;

create policy "Users manage own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  status milestone_status not null default 'not_started',
  progress smallint not null default 0 check (progress between 0 and 100),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_milestones_project_idx on public.project_milestones (project_id, sort_order);

alter table public.project_milestones enable row level security;

create policy "Users manage own project milestones"
  on public.project_milestones for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger project_milestones_set_updated_at
  before update on public.project_milestones
  for each row execute function public.set_updated_at();

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  file_path text not null,
  file_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index project_files_project_idx on public.project_files (project_id);

alter table public.project_files enable row level security;

create policy "Users manage own project files"
  on public.project_files for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.bugs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  severity bug_severity not null default 'medium',
  priority task_priority not null default 'medium',
  status bug_status not null default 'open',
  screenshot_url text,
  steps_to_reproduce text,
  expected_result text,
  actual_result text,
  solution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bugs_project_idx on public.bugs (project_id, status);

alter table public.bugs enable row level security;

create policy "Users manage own bugs"
  on public.bugs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger bugs_set_updated_at
  before update on public.bugs
  for each row execute function public.set_updated_at();

-- Unified activity feed: powers both the per-project "Activity" tab and the
-- account-wide Dev Log timeline (app/dev-log). One row per notable event.
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entity_type text not null, -- 'project' | 'task' | 'milestone' | 'bug' | 'application' | ...
  entity_id uuid,
  project_id uuid references public.projects (id) on delete cascade,
  action text not null, -- 'created' | 'completed' | 'status_changed' | 'connected' | ...
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index activity_log_user_idx on public.activity_log (user_id, occurred_at desc);
create index activity_log_project_idx on public.activity_log (project_id, occurred_at desc);

alter table public.activity_log enable row level security;

create policy "Users manage own activity log"
  on public.activity_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
