-- Business module Phase 2: Team/Agency CRM (clients, contacts, deal
-- pipeline, activity log). Every table is organization_id-scoped and gated
-- by is_org_member() from 20260819000001_organizations.sql — any active
-- member can see and manage the whole org's pipeline, matching the "shared
-- team CRM" model (not per-user ownership like the personal Career tables).

create type public.crm_client_status as enum ('active', 'inactive', 'archived');
create type public.crm_deal_stage as enum ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
create type public.crm_activity_type as enum ('call', 'email', 'meeting', 'note');

create table public.crm_clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  industry text,
  website text,
  status public.crm_client_status not null default 'active',
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_clients_org_idx on public.crm_clients (organization_id);

create trigger crm_clients_set_updated_at
  before update on public.crm_clients
  for each row execute function public.set_updated_at();

create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.crm_clients (id) on delete set null,
  name text not null,
  email text,
  phone text,
  role text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_contacts_org_idx on public.crm_contacts (organization_id);
create index crm_contacts_client_idx on public.crm_contacts (client_id);

create trigger crm_contacts_set_updated_at
  before update on public.crm_contacts
  for each row execute function public.set_updated_at();

create table public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.crm_clients (id) on delete set null,
  title text not null,
  value numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  stage public.crm_deal_stage not null default 'lead',
  owner_id uuid references auth.users (id) on delete set null,
  expected_close_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_deals_org_idx on public.crm_deals (organization_id);
create index crm_deals_client_idx on public.crm_deals (client_id);

create trigger crm_deals_set_updated_at
  before update on public.crm_deals
  for each row execute function public.set_updated_at();

create table public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.crm_clients (id) on delete cascade,
  deal_id uuid references public.crm_deals (id) on delete cascade,
  type public.crm_activity_type not null default 'note',
  description text not null,
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index crm_activities_org_idx on public.crm_activities (organization_id);
create index crm_activities_client_idx on public.crm_activities (client_id);
create index crm_activities_deal_idx on public.crm_activities (deal_id);

alter table public.crm_clients enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_deals enable row level security;
alter table public.crm_activities enable row level security;

create policy "Org members manage crm_clients"
  on public.crm_clients for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Org members manage crm_contacts"
  on public.crm_contacts for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Org members manage crm_deals"
  on public.crm_deals for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Org members manage crm_activities"
  on public.crm_activities for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
