-- Business module Phase 3: invoicing, expenses, and a simplified item
-- catalog that doubles as inventory (a nullable stock_quantity — null means
-- "a service, not tracked as stock"; a number means "a stocked item"). All
-- org_id-scoped via is_org_member(), matching the CRM tables from Phase 2.

create type public.crm_item_unit as enum ('hour', 'fixed', 'item');
create type public.invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'void');
create type public.expense_category as enum ('software', 'hardware', 'travel', 'marketing', 'contractor', 'office', 'other');

create table public.crm_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  unit_price numeric(12, 2) not null default 0,
  unit public.crm_item_unit not null default 'fixed',
  sku text,
  -- null = a service, not tracked as inventory; a number = a stocked item.
  -- Decremented when an invoice referencing it is sent (services/actions/invoicing.ts),
  -- incremented when a purchase order referencing it is received (Phase 4).
  stock_quantity integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_items_org_idx on public.crm_items (organization_id);

create trigger crm_items_set_updated_at
  before update on public.crm_items
  for each row execute function public.set_updated_at();

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.crm_clients (id) on delete set null,
  invoice_number text not null,
  status public.invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(12, 2) not null default 0,
  tax_rate numeric(5, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  notes text,
  paid_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_unique_number unique (organization_id, invoice_number)
);

create index invoices_org_idx on public.invoices (organization_id);
create index invoices_client_idx on public.invoices (client_id);

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  -- Denormalized from invoices.organization_id (same pattern as
  -- project_milestones.user_id) so RLS here is a plain is_org_member()
  -- check instead of a join into invoices.
  organization_id uuid not null references public.organizations (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  item_id uuid references public.crm_items (id) on delete set null,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null default 0,
  sort_order integer not null default 0
);

create index invoice_line_items_invoice_idx on public.invoice_line_items (invoice_id, sort_order);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  category public.expense_category not null default 'other',
  vendor text,
  amount numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  expense_date date not null default current_date,
  is_billable boolean not null default false,
  client_id uuid references public.crm_clients (id) on delete set null,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index expenses_org_idx on public.expenses (organization_id);

alter table public.crm_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.expenses enable row level security;

create policy "Org members manage crm_items"
  on public.crm_items for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Org members manage invoices"
  on public.invoices for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Org members manage invoice_line_items"
  on public.invoice_line_items for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Org members manage expenses"
  on public.expenses for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
