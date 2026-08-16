# Demo data seed script

Populates realistic demo data for one DevOS account — 5 projects with milestones and tasks,
time-tracking history, courses/skills/a roadmap, job applications with companies and contacts,
interview questions, coding problems, notes/snippets/ideas/bookmarks, habits with heatmap
history, goals, and a couple of portfolio entries.

## Usage

1. Sign up for a DevOS account in the app (so the user exists in Supabase Auth).
2. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` — from your Supabase project's
   Settings → API. This key bypasses row-level security and must never be exposed
   to the browser or committed.
3. Run:

   ```bash
   npm run seed -- --email you@example.com
   ```

The script looks up the account by email via the Supabase Admin API, then inserts
demo rows scoped to that `user_id`. It's safe to re-run — it always inserts new
rows rather than upserting, so running it twice will duplicate the demo data
(delete the rows first, or use a fresh account, if you want a clean re-seed).
