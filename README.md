# DevOS

A personal developer operating system — one place to run projects, tasks, time tracking, learning, career, notes, and analytics.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Radix primitives (hand-built shadcn-style kit) · Supabase (Postgres, Auth, Storage) · TanStack Query · Zustand · React Hook Form · Zod · Recharts.

See `ARCHITECTURE.md` for the full page map, database schema, and component architecture.

## Getting started

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Run the migrations** in `supabase/migrations/` against it, in order (via the Supabase SQL editor, or `supabase db push` with the Supabase CLI).
3. **Copy env vars**: `cp .env.local.example .env.local` and fill in your project's URL and anon key from Project Settings → API.
4. **Install and run**:

   ```bash
   npm install
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), sign up, and DevOS creates your profile automatically.

### Seed demo data (optional)

After signing up once, run the seed script to populate realistic sample data (projects, tasks, courses, applications, etc.) for your account:

```bash
npm run seed -- --email you@example.com
```

See `supabase/seed/README.md` for details.

### Career Agent (AI Career Hub)

`/career` is an AI-assisted career agent: a Career Profile that feeds a deterministic Job Match
score, live job search (a free keyless source) plus manual job capture, an Application Funnel,
Interviews, Assessments, and Career Analytics — all work out of the box with just Supabase.
LinkedIn sign-in works too, the same way GitHub does (enable the provider in your Supabase
dashboard) — though LinkedIn only ever shares your name/email/photo, never job data, by their
own API's design. Career Inbox (Gmail), interview scheduling (Google Calendar), and AI resume
tailoring/cover letters each need extra credentials — see the "Career Agent (Phases 2-6)" block
in `.env.local.example` and `ARCHITECTURE.md` → "8. Career Agent" for exactly what's required.

## Project structure

```
app/            Route groups: (auth) public auth pages, (app) authenticated shell + modules
components/     ui/ (design system), layout/, and per-module component folders
lib/            supabase clients, validation schemas, constants, zustand stores, utils
services/       actions/ (Server Actions, mutations) and queries/ (server-only reads)
types/          hand-authored types mirroring the Supabase schema
supabase/       SQL migrations and the demo data seed script
```
