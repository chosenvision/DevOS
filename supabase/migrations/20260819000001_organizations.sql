-- Multi-tenant foundation for the Business module (Team/Agency CRM + simplified
-- ERP). Purely additive: every existing table stays user_id-scoped exactly as
-- before. Organizations/members are the only shared-ownership tables in DevOS —
-- everything the Business module builds on top references organization_id and
-- is gated by the is_org_member()/has_org_role() helpers below, never user_id.

create type public.org_role as enum ('owner', 'admin', 'member');
create type public.org_member_status as enum ('invited', 'active');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users (id) on delete cascade,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9-]{3,64}$')
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- Null until an invited person signs up/logs in and the invite is matched
  -- to their account by email (see services/queries/organizations.ts).
  user_id uuid references auth.users (id) on delete cascade,
  invited_email text,
  role public.org_role not null default 'member',
  status public.org_member_status not null default 'active',
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  constraint organization_members_identity check (user_id is not null or invited_email is not null),
  constraint organization_members_unique_user unique (organization_id, user_id),
  constraint organization_members_unique_invite unique (organization_id, invited_email)
);

create index organization_members_user_idx on public.organization_members (user_id);
create index organization_members_org_idx on public.organization_members (organization_id);

-- security definer so RLS policies on organization_members/organizations can
-- call this without recursing into organization_members' own RLS.
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.has_org_role(org_id uuid, min_role public.org_role)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and (
        min_role = 'member'
        or (min_role = 'admin' and m.role in ('admin', 'owner'))
        or (min_role = 'owner' and m.role = 'owner')
      )
  );
$$;

comment on function public.is_org_member(uuid) is
  'True if the current user is an active member of the given organization. Base gate for every Business-module RLS policy.';
comment on function public.has_org_role(uuid, public.org_role) is
  'True if the current user is an active member of the given organization with at least the given role (owner > admin > member).';

alter table public.organizations enable row level security;

create policy "Members can view their organizations"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "Invited users can view organizations they're invited to"
  on public.organizations for select
  using (exists (
    select 1 from public.organization_members m
    where m.organization_id = organizations.id
      and m.invited_email = (auth.jwt() ->> 'email')
  ));

create policy "Users can create organizations they own"
  on public.organizations for insert
  with check (owner_id = auth.uid());

create policy "Owners can update their organization"
  on public.organizations for update
  using (public.has_org_role(id, 'owner'))
  with check (public.has_org_role(id, 'owner'));

create policy "Owners can delete their organization"
  on public.organizations for delete
  using (public.has_org_role(id, 'owner'));

alter table public.organization_members enable row level security;

create policy "Members can view organization roster"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

create policy "Invited users can see their own pending invite"
  on public.organization_members for select
  using (invited_email = (auth.jwt() ->> 'email'));

create policy "Owner can self-insert on organization creation"
  on public.organization_members for insert
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = auth.uid())
  );

create policy "Admins manage organization membership"
  on public.organization_members for all
  using (public.has_org_role(organization_id, 'admin'))
  with check (public.has_org_role(organization_id, 'admin'));

create policy "Users can accept their own pending invite"
  on public.organization_members for update
  using (invited_email = (auth.jwt() ->> 'email') and status = 'invited')
  with check (user_id = auth.uid() and status = 'active');

create policy "Members can leave their organization"
  on public.organization_members for delete
  using (user_id = auth.uid());
