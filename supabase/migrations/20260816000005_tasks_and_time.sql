-- Task management + time tracking.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  milestone_id uuid references public.project_milestones (id) on delete set null,
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  category text,
  tags text[] not null default '{}',
  due_date timestamptz,
  start_date timestamptz,
  estimated_minutes integer,
  actual_minutes integer not null default 0,
  is_recurring boolean not null default false,
  recurrence_frequency recurrence_frequency,
  recurrence_rule jsonb, -- e.g. {"interval":1,"byweekday":["MO"]}
  recurrence_parent_id uuid references public.tasks (id) on delete set null,
  sort_order integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_user_due_idx on public.tasks (user_id, due_date);
create index tasks_project_idx on public.tasks (project_id);

alter table public.tasks enable row level security;

create policy "Users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create table public.task_subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index task_subtasks_task_idx on public.task_subtasks (task_id, sort_order);

alter table public.task_subtasks enable row level security;

create policy "Users manage own task subtasks"
  on public.task_subtasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  task_id uuid references public.tasks (id) on delete set null,
  category time_entry_category not null default 'project',
  description text,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer,
  is_running boolean not null default false,
  source time_entry_source not null default 'timer',
  created_at timestamptz not null default now()
);

create index time_entries_user_started_idx on public.time_entries (user_id, started_at desc);
create index time_entries_running_idx on public.time_entries (user_id) where is_running;

alter table public.time_entries enable row level security;

create policy "Users manage own time entries"
  on public.time_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
