-- Learning Hub: courses, skills, roadmaps, resources, certifications.

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  platform text not null,
  instructor text,
  url text,
  status course_status not null default 'not_started',
  progress smallint not null default 0 check (progress between 0 and 100),
  total_lessons integer,
  completed_lessons integer not null default 0,
  estimated_duration_minutes integer,
  start_date date,
  target_completion_date date,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_user_idx on public.courses (user_id, status);

alter table public.courses enable row level security;

create policy "Users manage own courses"
  on public.courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index course_lessons_course_idx on public.course_lessons (course_id, sort_order);

alter table public.course_lessons enable row level security;

create policy "Users manage own course lessons"
  on public.course_lessons for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text,
  level skill_level not null default 'learning',
  hours_practiced numeric(8, 2) not null default 0,
  last_practiced_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index skills_user_idx on public.skills (user_id, level);

alter table public.skills enable row level security;

create policy "Users manage own skills"
  on public.skills for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

-- Link table so a skill can point at the projects that used it / resources saved for it.
create table public.skill_projects (
  skill_id uuid not null references public.skills (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (skill_id, project_id)
);

alter table public.skill_projects enable row level security;

create policy "Users manage own skill-project links"
  on public.skill_projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  is_custom boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.roadmaps enable row level security;

create policy "Users manage own roadmaps"
  on public.roadmaps for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger roadmaps_set_updated_at
  before update on public.roadmaps
  for each row execute function public.set_updated_at();

create table public.roadmap_steps (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status roadmap_step_status not null default 'upcoming',
  resource_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index roadmap_steps_roadmap_idx on public.roadmap_steps (roadmap_id, sort_order);

alter table public.roadmap_steps enable row level security;

create policy "Users manage own roadmap steps"
  on public.roadmap_steps for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  url text,
  category text,
  tags text[] not null default '{}',
  description text,
  status resource_status not null default 'unread',
  rating smallint check (rating between 1 and 5),
  notes text,
  date_added timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resources_user_idx on public.resources (user_id, status);

alter table public.resources enable row level security;

create policy "Users manage own resources"
  on public.resources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  provider text not null,
  date_earned date,
  expiration_date date,
  credential_id text,
  credential_url text,
  skills text[] not null default '{}',
  certificate_file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index certifications_user_idx on public.certifications (user_id);

alter table public.certifications enable row level security;

create policy "Users manage own certifications"
  on public.certifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger certifications_set_updated_at
  before update on public.certifications
  for each row execute function public.set_updated_at();
