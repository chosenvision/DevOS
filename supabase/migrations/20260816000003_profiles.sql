-- Profiles: one row per auth user, public-ish identity + gamification state.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  role text,
  location text,
  bio text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  website_url text,
  timezone text default 'UTC',
  xp integer not null default 0,
  level integer not null default 1,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username is null or username ~ '^[a-z0-9_-]{3,32}$')
);

create index profiles_username_idx on public.profiles (username);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Public profiles are viewable for portfolio pages"
  on public.profiles for select
  using (username is not null);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- User preferences: notifications, AI, appearance-adjacent settings not in profiles.
create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system',
  email_notifications boolean not null default true,
  push_notifications boolean not null default true,
  notify_task_due boolean not null default true,
  notify_project_deadline boolean not null default true,
  notify_interview_reminder boolean not null default true,
  notify_follow_up boolean not null default true,
  notify_habit_streak boolean not null default true,
  ai_enabled boolean not null default true,
  ai_model text default 'balanced',
  pomodoro_focus_minutes integer not null default 25,
  pomodoro_short_break_minutes integer not null default 5,
  pomodoro_long_break_minutes integer not null default 15,
  pomodoro_sessions_before_long_break integer not null default 4,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users manage own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user_preferences()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_preferences (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_preferences
  after insert on auth.users
  for each row execute function public.handle_new_user_preferences();
