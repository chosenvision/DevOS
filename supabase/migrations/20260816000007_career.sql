-- Career Hub: companies, contacts, job applications, resumes,
-- interview prep, STAR responses, coding practice.

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  website text,
  industry text,
  size text,
  location text,
  careers_url text,
  notes text,
  culture_notes text,
  salary_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index companies_user_idx on public.companies (user_id, name);

alter table public.companies enable row level security;

create policy "Users manage own companies"
  on public.companies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  name text not null,
  role text,
  linkedin_url text,
  email text,
  phone text,
  relationship text,
  last_contacted_at date,
  next_follow_up_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_user_idx on public.contacts (user_id);
create index contacts_follow_up_idx on public.contacts (user_id, next_follow_up_at);

alter table public.contacts enable row level security;

create policy "Users manage own contacts"
  on public.contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_job text,
  is_ats_mode boolean not null default true,
  is_portfolio_mode boolean not null default false,
  content jsonb not null default '{}'::jsonb, -- summary, education, experience, projects, skills, certs, achievements
  file_path text, -- last exported PDF, if any
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resumes_user_idx on public.resumes (user_id);

alter table public.resumes enable row level security;

create policy "Users manage own resumes"
  on public.resumes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  company_name text not null,
  position text not null,
  salary_min integer,
  salary_max integer,
  location text,
  work_mode work_mode,
  job_url text,
  date_applied date,
  source text,
  recruiter_name text,
  contact_email text,
  status application_status not null default 'saved',
  notes text,
  resume_id uuid references public.resumes (id) on delete set null,
  cover_letter_used text,
  next_follow_up_at date,
  interview_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index job_applications_user_status_idx on public.job_applications (user_id, status);
create index job_applications_follow_up_idx on public.job_applications (user_id, next_follow_up_at);

alter table public.job_applications enable row level security;

create policy "Users manage own job applications"
  on public.job_applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger job_applications_set_updated_at
  before update on public.job_applications
  for each row execute function public.set_updated_at();

create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category interview_category not null default 'behavioral',
  question text not null,
  answer text,
  notes text,
  difficulty difficulty_level not null default 'medium',
  confidence_level smallint not null default 1 check (confidence_level between 1 and 5),
  last_practiced_at timestamptz,
  company_id uuid references public.companies (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index interview_questions_user_idx on public.interview_questions (user_id, category);

alter table public.interview_questions enable row level security;

create policy "Users manage own interview questions"
  on public.interview_questions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger interview_questions_set_updated_at
  before update on public.interview_questions
  for each row execute function public.set_updated_at();

create table public.star_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  situation text,
  task text,
  action text,
  result text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.star_responses enable row level security;

create policy "Users manage own STAR responses"
  on public.star_responses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger star_responses_set_updated_at
  before update on public.star_responses
  for each row execute function public.set_updated_at();

create table public.coding_problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  platform text not null,
  url text,
  difficulty difficulty_level not null default 'medium',
  topic text[] not null default '{}',
  status task_status not null default 'todo',
  attempts integer not null default 0,
  time_taken_minutes integer,
  solution text,
  notes text,
  review_date date,
  last_attempted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index coding_problems_user_idx on public.coding_problems (user_id, status);
create index coding_problems_review_idx on public.coding_problems (user_id, review_date);

alter table public.coding_problems enable row level security;

create policy "Users manage own coding problems"
  on public.coding_problems for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger coding_problems_set_updated_at
  before update on public.coding_problems
  for each row execute function public.set_updated_at();
