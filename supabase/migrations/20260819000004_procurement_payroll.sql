-- Business module Phase 4: purchase orders (simplified procurement),
-- payroll-lite, and time off. Vendors/POs follow the same is_org_member()
-- "any active member manages" pattern as CRM/invoicing. Payroll and time
-- off are HR data, so their RLS is deliberately stricter: a regular member
-- can see and request only their own records; only an org admin/owner can
-- see everyone's, record payroll, or approve/deny a time off request. This
-- is enforced in RLS itself, not just the Server Action layer, the same way
-- the Phase 1 organization_members policies split invite-acceptance from
-- admin-only membership management.

create type public.po_status as enum ('draft', 'sent', 'received', 'cancelled');
create type public.payroll_status as enum ('draft', 'recorded');
create type public.time_off_type as enum ('vacation', 'sick', 'unpaid');
create type public.time_off_status as enum ('pending', 'approved', 'denied');

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  contact_email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vendors_org_idx on public.vendors (organization_id);

create trigger vendors_set_updated_at
  before update on public.vendors
  for each row execute function public.set_updated_at();

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  vendor_id uuid references public.vendors (id) on delete set null,
  po_number text not null,
  status public.po_status not null default 'draft',
  order_date date not null default current_date,
  expected_date date,
  total numeric(12, 2) not null default 0,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_orders_unique_number unique (organization_id, po_number)
);

create index purchase_orders_org_idx on public.purchase_orders (organization_id);

create trigger purchase_orders_set_updated_at
  before update on public.purchase_orders
  for each row execute function public.set_updated_at();

create table public.purchase_order_line_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders (id) on delete cascade,
  -- Receiving the PO (status -> 'received') increments this item's
  -- stock_quantity when set, closing the loop with the Phase 3 decrement
  -- on invoice send.
  item_id uuid references public.crm_items (id) on delete set null,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_cost numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null default 0,
  sort_order integer not null default 0
);

create index po_line_items_po_idx on public.purchase_order_line_items (purchase_order_id, sort_order);

create table public.payroll_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  member_id uuid not null references public.organization_members (id) on delete cascade,
  pay_period_start date not null,
  pay_period_end date not null,
  gross_amount numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  status public.payroll_status not null default 'draft',
  -- Deliberately just a ledger entry: no tax withholding, no direct
  -- deposit, no payment processing. The UI states this plainly.
  notes text,
  recorded_by uuid references auth.users (id) on delete set null,
  recorded_at timestamptz,
  created_at timestamptz not null default now(),
  constraint payroll_valid_period check (pay_period_end >= pay_period_start)
);

create index payroll_records_org_idx on public.payroll_records (organization_id);
create index payroll_records_member_idx on public.payroll_records (member_id);

create table public.time_off_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  member_id uuid not null references public.organization_members (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  type public.time_off_type not null default 'vacation',
  status public.time_off_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  constraint time_off_valid_range check (end_date >= start_date)
);

create index time_off_org_idx on public.time_off_requests (organization_id);
create index time_off_member_idx on public.time_off_requests (member_id);

alter table public.vendors enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_line_items enable row level security;
alter table public.payroll_records enable row level security;
alter table public.time_off_requests enable row level security;

create policy "Org members manage vendors"
  on public.vendors for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Org members manage purchase_orders"
  on public.purchase_orders for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Org members manage purchase_order_line_items"
  on public.purchase_order_line_items for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Payroll: admins manage everything; a member may only ever see their own.
create policy "Admins manage payroll"
  on public.payroll_records for all
  using (public.has_org_role(organization_id, 'admin'))
  with check (public.has_org_role(organization_id, 'admin'));

create policy "Members view their own payroll"
  on public.payroll_records for select
  using (exists (
    select 1 from public.organization_members m
    where m.id = payroll_records.member_id and m.user_id = auth.uid()
  ));

-- Time off: a member can see/request/cancel-while-pending their own;
-- only admins can approve, deny, or touch anyone else's.
create policy "Admins manage all time off"
  on public.time_off_requests for all
  using (public.has_org_role(organization_id, 'admin'))
  with check (public.has_org_role(organization_id, 'admin'));

create policy "Members view their own time off"
  on public.time_off_requests for select
  using (exists (
    select 1 from public.organization_members m
    where m.id = time_off_requests.member_id and m.user_id = auth.uid()
  ));

create policy "Members request their own time off"
  on public.time_off_requests for insert
  with check (exists (
    select 1 from public.organization_members m
    where m.id = time_off_requests.member_id and m.user_id = auth.uid()
  ));

create policy "Members cancel their own pending time off"
  on public.time_off_requests for delete
  using (
    status = 'pending'
    and exists (
      select 1 from public.organization_members m
      where m.id = time_off_requests.member_id and m.user_id = auth.uid()
    )
  );
