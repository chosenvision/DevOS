-- Career Agent, Phase 1: master career profile, job search preferences,
-- manually-captured job listings with a deterministic match score, and a
-- lightweight assessment tracker. Extends the existing Career Hub schema
-- (companies, contacts, job_applications, resumes) rather than duplicating
-- it — see ARCHITECTURE.md "Career Agent" section for the phased roadmap.

create type employment_type as enum ('full_time', 'part_time', 'contract', 'internship');
create type job_listing_status as enum ('new', 'saved', 'dismissed', 'applied');
create type match_recommendation as enum ('excellent_match', 'strong_match', 'possible_match', 'weak_match');
create type assessment_type as enum (
  'coding', 'sql', 'excel', 'case_study', 'personality', 'video_interview', 'take_home_project', 'other'
);
create type assessment_status as enum ('not_started', 'in_progress', 'submitted', 'passed', 'failed');

-- One row per user: the reusable source of truth the match engine and
-- (future) application prep compare every job against. Detailed work
-- history stays on `resumes` (which already models experience/education/
-- skills as structured JSON) — this table holds the job-search-specific
-- preferences and logistics that don't belong on any one resume.
create table public.career_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  professional_summary text,
  years_experience numeric(4, 1),
  skills text[] not null default '{}',
  preferred_roles text[] not null default '{}',
  preferred_industries text[] not null default '{}',
  preferred_locations text[] not null default '{}',
  excluded_companies text[] not null default '{}',
  excluded_keywords text[] not null default '{}',
  remote_ok boolean not null default true,
  hybrid_ok boolean not null default true,
  onsite_ok boolean not null default true,
  employment_types employment_type[] not null default '{full_time}',
  min_salary integer,
  target_salary integer,
  notice_period text,
  work_authorization text,
  primary_resume_id uuid references public.resumes (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.career_profiles enable row level security;

create policy "Users manage own career profile"
  on public.career_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger career_profiles_set_updated_at
  before update on public.career_profiles
  for each row execute function public.set_updated_at();

-- Named search profiles ("Data Analyst — Remote"). Doubles as job-alert
-- configuration (`notify_on_match`) for once a live job source is
-- connected — see job_listings.source below.
create table public.job_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  titles text[] not null default '{}',
  keywords text[] not null default '{}',
  locations text[] not null default '{}',
  remote_ok boolean not null default true,
  hybrid_ok boolean not null default true,
  onsite_ok boolean not null default true,
  employment_types employment_type[] not null default '{full_time}',
  min_salary integer,
  is_active boolean not null default true,
  notify_on_match boolean not null default false,
  match_threshold smallint not null default 80 check (match_threshold between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index job_searches_user_idx on public.job_searches (user_id);

alter table public.job_searches enable row level security;

create policy "Users manage own job searches"
  on public.job_searches for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger job_searches_set_updated_at
  before update on public.job_searches
  for each row execute function public.set_updated_at();

-- Job listings. Phase 1 has no live external job source, so these are
-- captured manually (paste a URL + description) — the schema is shaped so
-- a future job-board integration can insert into the same table without a
-- migration. Match fields are computed by lib/career-match.ts (a pure,
-- deterministic function — no AI provider required) and cached here.
create table public.job_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  title text not null,
  company_name text not null,
  location text,
  work_mode work_mode,
  employment_type employment_type,
  salary_min integer,
  salary_max integer,
  description text,
  skills text[] not null default '{}',
  url text,
  source text not null default 'manual',
  posted_date date,
  status job_listing_status not null default 'saved',
  match_score smallint check (match_score between 0 and 100),
  match_recommendation match_recommendation,
  match_why text[] not null default '{}',
  match_missing text[] not null default '{}',
  match_sub_scores jsonb not null default '{}'::jsonb,
  match_computed_at timestamptz,
  application_id uuid references public.job_applications (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index job_listings_user_status_idx on public.job_listings (user_id, status);
create index job_listings_user_match_idx on public.job_listings (user_id, match_score);

alter table public.job_listings enable row level security;

create policy "Users manage own job listings"
  on public.job_listings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger job_listings_set_updated_at
  before update on public.job_listings
  for each row execute function public.set_updated_at();

-- Assessment tracker (technical screens, take-homes, etc.) — distinct from
-- job_applications.status = 'assessment' because one application can carry
-- multiple assessments with their own deadlines/platforms/scores.
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid references public.job_applications (id) on delete cascade,
  company_name text not null,
  role text,
  assessment_type assessment_type not null default 'other',
  platform text,
  url text,
  deadline timestamptz,
  status assessment_status not null default 'not_started',
  score text,
  notes text,
  task_id uuid references public.tasks (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assessments_user_status_idx on public.assessments (user_id, status);
create index assessments_user_deadline_idx on public.assessments (user_id, deadline);

alter table public.assessments enable row level security;

create policy "Users manage own assessments"
  on public.assessments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger assessments_set_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();
