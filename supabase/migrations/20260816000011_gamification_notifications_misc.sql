-- Gamification, notifications, daily journal, generic file metadata.

-- Achievement catalog is global (not user-owned) and readable by every
-- authenticated user; only user_achievements rows are personal.
create table public.achievements (
  key text primary key,
  title text not null,
  description text not null,
  icon text,
  xp_reward integer not null default 0,
  criteria jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0
);

alter table public.achievements enable row level security;

create policy "Achievements catalog is readable by authenticated users"
  on public.achievements for select
  to authenticated
  using (true);

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_key text not null references public.achievements (key) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_key)
);

create index user_achievements_user_idx on public.user_achievements (user_id);

alter table public.user_achievements enable row level security;

create policy "Users manage own unlocked achievements"
  on public.user_achievements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text,
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

create policy "Users manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null default current_date,
  what_worked_on text,
  what_learned text,
  blockers text,
  tomorrow_plan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index daily_logs_user_idx on public.daily_logs (user_id, log_date desc);

alter table public.daily_logs enable row level security;

create policy "Users manage own daily logs"
  on public.daily_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger daily_logs_set_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();

-- Generic file metadata for anything uploaded to Supabase Storage that
-- doesn't already have a dedicated column (e.g. certificates, reference docs).
create table public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  related_type text, -- 'certification' | 'resume' | 'project' | 'bug' | null
  related_id uuid,
  file_name text not null,
  file_path text not null,
  file_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index files_user_idx on public.files (user_id, related_type, related_id);

alter table public.files enable row level security;

create policy "Users manage own files"
  on public.files for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed the achievement catalog (see spec section 39: Gamification).
insert into public.achievements (key, title, description, icon, xp_reward, sort_order) values
  ('first_project', 'First Project', 'Created your first project', 'Rocket', 25, 1),
  ('ten_projects_completed', '10 Projects Completed', 'Completed 10 projects', 'Trophy', 150, 2),
  ('hundred_tasks_completed', '100 Tasks Completed', 'Completed 100 tasks', 'CheckCircle2', 100, 3),
  ('seven_day_streak', '7-Day Coding Streak', 'Coded 7 days in a row', 'Flame', 50, 4),
  ('thirty_day_streak', '30-Day Coding Streak', 'Coded 30 days in a row', 'Flame', 200, 5),
  ('first_interview', 'First Interview', 'Landed your first interview', 'MessagesSquare', 75, 6),
  ('first_offer', 'First Job Offer', 'Received your first job offer', 'PartyPopper', 300, 7),
  ('hundred_problems_solved', '100 Coding Problems', 'Solved 100 coding problems', 'Code2', 150, 8)
on conflict (key) do nothing;
