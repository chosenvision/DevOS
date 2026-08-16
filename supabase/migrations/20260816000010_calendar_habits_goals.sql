-- Calendar (standalone events; tasks/deadlines/interviews are read live from
-- their own tables and merged client-side), habit tracker, goal management.

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  event_type calendar_event_type not null default 'custom',
  start_at timestamptz not null,
  end_at timestamptz,
  all_day boolean not null default false,
  related_type text, -- 'task' | 'project' | 'application' | 'course' | 'goal' | null
  related_id uuid,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index calendar_events_user_idx on public.calendar_events (user_id, start_at);

alter table public.calendar_events enable row level security;

create policy "Users manage own calendar events"
  on public.calendar_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text,
  target_frequency habit_frequency not null default 'daily',
  target_days_per_week smallint check (target_days_per_week between 1 and 7),
  color text default '#6366f1',
  icon text,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index habits_user_idx on public.habits (user_id) where archived_at is null;

alter table public.habits enable row level security;

create policy "Users manage own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

create table public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  is_completed boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  unique (habit_id, entry_date)
);

create index habit_entries_habit_idx on public.habit_entries (habit_id, entry_date desc);

alter table public.habit_entries enable row level security;

create policy "Users manage own habit entries"
  on public.habit_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text,
  period goal_period not null default 'monthly',
  start_date date not null default current_date,
  deadline date,
  progress smallint not null default 0 check (progress between 0 and 100),
  status goal_status not null default 'not_started',
  related_project_id uuid references public.projects (id) on delete set null,
  related_skill_id uuid references public.skills (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_idx on public.goals (user_id, period, status);

alter table public.goals enable row level security;

create policy "Users manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

create table public.goal_milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index goal_milestones_goal_idx on public.goal_milestones (goal_id, sort_order);

alter table public.goal_milestones enable row level security;

create policy "Users manage own goal milestones"
  on public.goal_milestones for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
