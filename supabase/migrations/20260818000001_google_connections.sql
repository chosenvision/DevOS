-- Google account connection (Gmail + Calendar), for Career Inbox and
-- interview scheduling. A custom OAuth flow, not Supabase's linkIdentity —
-- linkIdentity doesn't persist a third-party provider's tokens for later
-- server-side API calls (only exposes them transiently on the client at
-- sign-in), and this needs offline access (a refresh token) plus specific
-- Gmail/Calendar scopes Supabase's generic Google sign-in doesn't request.
--
-- refresh_token is stored encrypted (AES-256-GCM, see lib/crypto/token-
-- encryption.ts) — never in plaintext, never exposed to the client.

create table public.google_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  google_email text not null,
  google_name text,
  avatar_url text,
  encrypted_refresh_token text not null,
  granted_scopes text[] not null default '{}',
  gmail_connected boolean not null default false,
  calendar_connected boolean not null default false,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz
);

alter table public.google_connections enable row level security;

create policy "Users manage own Google connection"
  on public.google_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
