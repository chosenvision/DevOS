-- Supabase Storage buckets for user-uploaded files. Every object path is
-- namespaced by `${auth.uid()}/...` so RLS can scope access per owner.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('project-covers', 'project-covers', true, 10485760, array['image/png', 'image/jpeg', 'image/webp']),
  ('project-files', 'project-files', false, 26214400, null),
  ('portfolio-images', 'portfolio-images', true, 10485760, array['image/png', 'image/jpeg', 'image/webp']),
  ('certificates', 'certificates', false, 10485760, array['image/png', 'image/jpeg', 'application/pdf']),
  ('resumes', 'resumes', false, 10485760, array['application/pdf']),
  ('bug-screenshots', 'bug-screenshots', false, 10485760, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- Public read for public buckets; owner-only write, scoped by the first
-- path segment (the user's uid), for every bucket.
create policy "Public buckets are readable by anyone"
  on storage.objects for select
  using (bucket_id in ('avatars', 'project-covers', 'portfolio-images'));

create policy "Users read own files in private buckets"
  on storage.objects for select
  using (
    bucket_id in ('project-files', 'certificates', 'resumes', 'bug-screenshots')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users upload files into their own folder"
  on storage.objects for insert
  to authenticated
  with check (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update their own files"
  on storage.objects for update
  to authenticated
  using (auth.uid()::text = (storage.foldername(name))[1])
  with check (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete their own files"
  on storage.objects for delete
  to authenticated
  using (auth.uid()::text = (storage.foldername(name))[1]);
