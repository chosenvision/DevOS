-- DevOS database bootstrap: extensions + shared helper functions/triggers.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Generic updated_at maintenance trigger, reused by every table below.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Sets updated_at = now() on every UPDATE. Attach with a BEFORE UPDATE trigger.';
