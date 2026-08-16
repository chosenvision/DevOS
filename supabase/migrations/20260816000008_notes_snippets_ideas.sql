-- Second Brain: notes, folders, code snippets, idea vault, bookmarks.

create table public.note_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  parent_folder_id uuid references public.note_folders (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index note_folders_user_idx on public.note_folders (user_id, parent_folder_id);

alter table public.note_folders enable row level security;

create policy "Users manage own note folders"
  on public.note_folders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  folder_id uuid references public.note_folders (id) on delete set null,
  title text not null,
  content text not null default '',
  type note_type not null default 'general',
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_user_idx on public.notes (user_id, is_archived, updated_at desc);
create index notes_search_idx on public.notes using gin (to_tsvector('english', title || ' ' || content));

alter table public.notes enable row level security;

create policy "Users manage own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create table public.code_snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  language text not null,
  description text,
  code text not null,
  tags text[] not null default '{}',
  category text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index code_snippets_user_idx on public.code_snippets (user_id, language);

alter table public.code_snippets enable row level security;

create policy "Users manage own code snippets"
  on public.code_snippets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger code_snippets_set_updated_at
  before update on public.code_snippets
  for each row execute function public.set_updated_at();

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text,
  potential smallint check (potential between 1 and 5),
  difficulty difficulty_level,
  estimated_build_time text,
  tech_stack text[] not null default '{}',
  status idea_status not null default 'inbox',
  converted_project_id uuid references public.projects (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ideas_user_idx on public.ideas (user_id, status);

alter table public.ideas enable row level security;

create policy "Users manage own ideas"
  on public.ideas for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger ideas_set_updated_at
  before update on public.ideas
  for each row execute function public.set_updated_at();

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  url text not null,
  website text,
  category text,
  tags text[] not null default '{}',
  date_saved timestamptz not null default now()
);

create index bookmarks_user_idx on public.bookmarks (user_id, date_saved desc);

alter table public.bookmarks enable row level security;

create policy "Users manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
