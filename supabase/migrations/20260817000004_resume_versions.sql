-- AI resume tailoring: a tailored resume is saved as a NEW row (never
-- overwrites the source), linked back to what it was tailored from and
-- for, with a plain-language summary of what actually changed.

alter table public.resumes
  add column if not exists parent_resume_id uuid references public.resumes (id) on delete set null,
  add column if not exists tailored_for_job_id uuid references public.job_listings (id) on delete set null,
  add column if not exists change_summary text[] not null default '{}';

create index if not exists resumes_parent_idx on public.resumes (parent_resume_id);
