# DevOS Architecture

A reference for how the app is put together — written after the build so it reflects what
actually ships, not just what was planned. See `README.md` for setup instructions.

## 1. Product architecture

DevOS is a Next.js 16 App Router application backed entirely by Supabase (Postgres + Auth +
Storage). There is no separate backend service — Server Components read directly from Supabase
with the user's session, and Server Actions perform every mutation. This keeps the architecture
to three layers:

```
Browser (Client Components: forms, charts, drag-and-drop, live timers)
        │  Server Actions (mutations) · React Server Components (reads)
        ▼
Next.js server (app/, services/actions, services/queries)
        │  postgres wire protocol, scoped by the request's Supabase session
        ▼
Supabase (Postgres + RLS, Auth, Storage)
```

Every table has row-level security scoped to `auth.uid()`, so the database — not application
code — is the last line of defense for data isolation. Server Components fetch with the
user's own session (`lib/supabase/server.ts`), never a service-role key; the one exception is
`supabase/seed/seed.ts`, a standalone script that intentionally needs the service role to write
into another user's account before that user has ever made an authenticated request.

Two route groups split the app:

- `app/(auth)/*` — public, unauthenticated pages (login, sign-up, password reset), wrapped in a
  split-screen marketing layout.
- `app/(app)/*` — everything behind sign-in, wrapped in `AppShell` (sidebar + topbar + command
  palette + quick add). `proxy.ts` (Next 16's renamed `middleware.ts`) refreshes the Supabase
  session on every request and redirects unauthenticated visitors to `/login`.

Three routes intentionally live outside both groups because they need a different chrome:
`/focus/[taskId]` (distraction-free, no sidebar), `/print/resume/[id]` (print-optimized, no
app UI at all), and `/portfolio/[username]` (public, no auth required).

## 2. Page map

```
/                                  Public landing page (redirects to /dashboard if signed in)
/login, /sign-up                   Auth
/forgot-password, /reset-password  Password recovery
/auth/callback, /auth/confirm      OAuth + email-link handlers

/dashboard                         Command center: KPIs, today, activity chart, current project

/projects                          Grid / List / Kanban / Timeline views
/projects/[slug]                   Overview · Tasks · Milestones · Notes · Files · Bugs · Activity · Settings

/tasks                             Today · Upcoming · All · Kanban · Calendar · Completed
/focus/[taskId]                    Focus Mode (own layout, no sidebar)

/time-tracking                     Timer, Pomodoro, manual entry, stats, recent sessions

/learning                          Overview
/learning/courses                  /skills  /roadmap  /resources  /certifications

/career                            -> redirects to /career/applications
/career/applications                Kanban / Table / Calendar + pipeline analytics
/career/resume, /career/resume/[id] Resume list + section editor
/career/interview-prep              Questions · STAR Builder · Mock Interview
/career/coding-practice             Problem tracker + spaced-repetition review queue
/career/companies, /career/contacts Research notes + follow-up reminders

/notes                             All Notes (search, type filter, pin/favorite)
/notes/[id]                        Markdown editor (write/preview)
/notes/snippets                    Syntax-highlighted snippet library
/notes/ideas                       Idea Vault (kanban, convert-to-project)
/notes/bookmarks                   Saved links

/analytics                         Overview charts (range: 7d/30d/3m/1y)
/analytics/habits                  Heatmaps, streaks
/analytics/goals                   Weekly/monthly/quarterly/yearly goals

/calendar                          Month (drag to reschedule) · Week · Day · Agenda

/portfolio                         Manage which projects are public
/portfolio/[username]              Public portfolio page (no auth)
/print/resume/[id]                 Print/PDF-export view for a resume

/settings                          -> redirects to /settings/profile
/settings/profile                   Avatar, bio, links, XP/level, achievements
/settings/appearance                 Theme
/settings/notifications              Per-category toggles
/settings/integrations               GitHub identity linking
/settings/ai                         AI preference placeholder (no provider connected yet)
/settings/data                       CSV/JSON export, JSON backup import
/settings/security                   Password change, account info
```

## 3. Feature hierarchy

```
DevOS
├── Command Center (Dashboard, global Cmd+K palette, Quick Add — 7 entity types)
├── Projects           (CRUD, 4 views, 8 detail tabs, activity log, Storage-backed files)
├── Tasks               (6 views, smart filters, recurring tasks, subtasks, Focus Mode)
├── Time Tracking        (live timer, Pomodoro, manual entries, per-project/tech analytics)
├── Learning Hub
│   ├── Courses (progress tracking)
│   ├── Skills (leveled tracker)
│   ├── Roadmap (step chains with auto-advance)
│   ├── Resources (status-filterable library)
│   └── Certifications (expiry tracking)
├── Career Hub
│   ├── Applications (9-stage pipeline, analytics)
│   ├── Resume Builder (multi-resume, section editor, DevOS-data generator, print/PDF)
│   ├── Interview Prep (question bank, STAR builder, Mock Interview mode)
│   ├── Coding Practice (spaced-repetition review scheduling)
│   ├── Companies & Contacts (research notes, follow-up reminders)
├── Notes / Second Brain (markdown, pin/favorite, search)
│   ├── Code Snippets (syntax highlighting, copy)
│   ├── Idea Vault (kanban, convert-to-project)
│   └── Bookmarks
├── Calendar             (aggregates tasks/deadlines/interviews/courses/goals/custom events)
├── Analytics            (charts + Habit Tracker + Goal Management)
├── Portfolio Manager    (public page generator)
└── Settings             (profile, appearance, notifications, integrations, AI, data, security)
```

## 4. Database schema

Full detail lives in `supabase/migrations/*.sql` (12 files, applied in filename order) — this is
a summary. ~40 tables, every one with `user_id uuid references auth.users` and an RLS policy
scoping all access to `auth.uid() = user_id` (two tables are intentionally different: `achievements`
is a shared read-only catalog, and `portfolio_projects` additionally allows public `select` where
`is_published = true`, which is what powers `/portfolio/[username]`).

| Domain | Tables |
|---|---|
| Identity | `profiles`, `user_preferences` |
| Projects | `projects`, `project_milestones`, `project_files`, `bugs`, `activity_log` |
| Tasks | `tasks`, `task_subtasks` |
| Time | `time_entries` |
| Learning | `courses`, `course_lessons`, `skills`, `skill_projects`, `roadmaps`, `roadmap_steps`, `resources`, `certifications` |
| Career | `companies`, `contacts`, `resumes`, `job_applications`, `interview_questions`, `star_responses`, `coding_problems` |
| Notes | `note_folders`, `notes`, `code_snippets`, `ideas`, `bookmarks` |
| Portfolio / GitHub | `portfolio_projects`, `github_connections`, `github_repos` |
| Calendar / habits / goals | `calendar_events`, `habits`, `habit_entries`, `goals`, `goal_milestones` |
| Misc | `notifications`, `daily_logs`, `achievements`, `user_achievements`, `files` |

Notable design choices:

- **`activity_log` is shared** by the per-project Activity tab and could back an account-wide
  Dev Log (spec #29) — the table and query pattern exist; only the dedicated `/dev-log` page
  wasn't built (see gaps below).
- **`task_subtasks` is a lightweight checklist**, not a self-referencing `tasks` row, so Focus
  Mode and the task detail sheet can render it as plain checkboxes.
- **The calendar has no dedicated "deadline" table.** `calendar_events` only stores standalone
  items (custom reminders, study sessions); task due dates, project deadlines, interview dates,
  course target dates, and goal deadlines are read live from their own tables and merged at
  query time (`services/queries/calendar.ts`). One source of truth, no sync to keep consistent.
- **Storage buckets** (`supabase/migrations/..._storage_buckets.sql`): `avatars`,
  `project-covers`, `portfolio-images` (public); `project-files`, `certificates`, `resumes`,
  `bug-screenshots` (private, path-scoped to `${auth.uid()}/...`).

## 5. Component architecture

```
app/                  Route files only — thin: fetch via services/queries, render components
  (auth)/             Public auth pages
  (app)/              Authenticated shell + one folder per module
  focus/, print/, portfolio/[username]/   Routes outside the app shell

components/
  ui/                 Hand-built shadcn-style primitives on Radix (button, dialog, select, ...)
  layout/             AppShell, Sidebar, Topbar, CommandPalette, QuickAddDialog, timer pill
  shared/             Cross-module building blocks: KanbanBoard (dnd-kit), MonthCalendar,
                       EmptyState, SubNav, theme/query providers
  dashboard/, projects/, tasks/, learning/, career/, notes/, calendar/, analytics/, settings/
                      One folder per module, mirroring app/(app)/<module>

services/
  actions/            Server Actions ("use server") — every mutation, one file per domain
  queries/            Plain async functions — every read, called only from Server Components
  auth.ts             requireUser() — the one auth guard, used by every protected page/action
  activity.ts         logActivity() — internal helper, not an action itself

lib/                  supabase clients, zod schemas (validations/), constants, analytics math,
                       zustand UI store (command palette + quick add open state), csv.ts

types/database.ts     Hand-authored types mirroring the SQL schema (no generated client types,
                       since this environment has no live Supabase project to introspect)
```

The **reads-vs-mutations split** (`services/queries` vs `services/actions`) is the one
consistent rule across all 12 modules: Server Components call `queries/*` directly; every form,
button, and drag handler calls an `actions/*` Server Action, which validates with Zod, writes
with the request's own Supabase session (RLS enforced), and calls `revalidatePath` for the
affected routes. `KanbanBoard` and `MonthCalendar` are the only two components built generically
enough to be reused across modules (Projects/Tasks/Career/Ideas kanbans; Tasks/Career/Calendar
month views).

## 6. User flows

**Sign up → first project**
`/sign-up` → email confirmation link → `/auth/confirm` verifies the OTP and redirects to
`/dashboard` → empty-state CTA on `/projects` → `ProjectFormDialog` (Server Action `createProject`,
generates a unique slug, logs to `activity_log`) → redirected straight to `/projects/[slug]`.

**Quick Add, from anywhere**
`Cmd/Ctrl+K` or the sidebar button → `useUIStore` opens `QuickAddDialog` → tab picker across 7
entity types → each tab's own small Server Action → `revalidatePath` refreshes whatever page is
open underneath without a full reload.

**Task → Focus session → recurrence**
Task row → Focus icon → `/focus/[taskId]` (no sidebar) → Start timer (`startTimer`, ties a
`time_entries` row to the task) → work → Complete task → `updateTaskStatus` marks it done, logs
activity, and — if the task is recurring — inserts the next occurrence with an advanced due date
in the same call.

**Job application → interview → offer**
`/career/applications` → Quick Add or full form (`createApplication`) → card lands in the
pipeline's Kanban `Saved` column → drag across stages (`updateApplicationStatus`, logs activity)
→ set an `interview_date` → shows up automatically on `/calendar` and in the Dashboard's
"Interview Reminders" — one write, two surfaces, no duplication.

**Idea → project**
`/notes/ideas` → capture → drag to `Validated`/`Planned` → "Convert to project"
(`convertIdeaToProject`) → creates a real `projects` row (slug, description, tech stack carried
over), links back via `ideas.converted_project_id`, redirects to the new project.

## 7. Dashboard wireframe (as built)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Good evening, Kristhian 👋                                  [+ Quick add]│
│ Small steps compound. Let's keep the streak alive.                        │
│ Saturday, August 16 · 9:41 PM                                             │
├──────────────────────────────────────────────────────────────────────────┤
│ [Active   ] [Tasks Due ] [Coding    ] [Coding  ] [Learning] [Job    ]     │
│ [Projects ] [Today     ] [Hours     ] [Streak  ] [Hours   ] [Apps   ]     │
│  ▲12%        ▼1          ▲8%           🔥5 days   ▲20%       ▲2           │
│                                          [Upcoming Interviews] [GitHub]   │
├──────────────────────────────────────────────────────────────────────────┤
│ Today's Tasks (checkable)        │ Upcoming Deadlines                    │
│  ☐ Design category UI      HIGH  │  AI Expense Tracker · in 20 days      │
│  ☐ Practice SQL joins    MEDIUM  │  Update resume · in 3 days            │
│                                    │ Interview Reminders                  │
│                                    │  Frontend Eng @ Acme · Thu 2:00 PM   │
├──────────────────────────────────────────────────────────────────────────┤
│ Weekly Activity                          [7 Days] [30 Days] [3M] [1Y]    │
│  ▄▅▆█▅▃▄  Coding hours     ▂▃▄▃▂▁▂  Study hours   ▁▃▂▄▁▂▃  Tasks done    │
├──────────────────────────────────────────────────────────────────────────┤
│ Current Project                          │ Productivity Score            │
│  AI Expense Tracker            [Open →]  │      ╭───────╮                │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  62%                 │      │  68   │  "Steady        │
│  Milestone: Backend & categorization      │      ╰───────╯  progress —    │
│  Tasks: 8/13 remaining · 20d left         │  a couple more focused        │
│  React · Next.js · Supabase · TypeScript  │  sessions would help."        │
└──────────────────────────────────────────────────────────────────────────┘
```

Sidebar (desktop, `lg:` and up): logo, Quick Add button with `⌘K` hint, the 8 main nav items,
Settings pinned at the bottom. Collapses to a `Sheet` drawer below `lg`. Topbar: search/palette
trigger, active timer pill (when a session is running), Quick Add, notifications, theme toggle,
user menu.

## 8. Career Agent

The Career Hub was expanded into an AI Career Agent per a 44-section product spec, built in the
phased order the spec itself lays out. **Phase 1, LinkedIn sign-in, and live job search are
fully built and real** — no fake buttons, no placeholder data. The rest needs external
credentials (an LLM API key, Gmail/Calendar OAuth) this environment doesn't have, so that
UI/architecture exists but is honestly marked "Connection Required" (see
`components/shared/connection-required.tsx` and
`components/settings/integration-placeholder-card.tsx`) rather than faked. Nothing here breaks
or duplicates the pre-existing Career Hub (Applications, Resume Builder, Companies, Contacts,
Interview Prep, Coding Practice) — it's extended in place.

**Phase 1 — built:**

- **Career Profile** (`career_profiles`, `/career/profile`) — the source of truth for job
  matching: skills, preferred roles/industries/locations, excluded companies/keywords, work
  setup, employment type, salary range, notice period, work authorization. Detailed work
  history/education intentionally stays on `resumes` (already structured JSON) rather than
  being duplicated here.
- **Job Match Engine** (`lib/career-match.ts`) — a deterministic, explainable 0–100% score
  (skills 40% / title 20% / location+work-setup 20% / salary 20%, with excluded companies/
  keywords capping the score) that needs no AI provider. Every job gets sub-scores, "Why You
  Match" / "Missing" bullets, and a recommendation tier (Excellent/Strong/Possible/Weak Match).
- **Job Search** (`job_listings`, `job_searches`, `/career/job-search`) — jobs can be added
  manually (paste a URL + description) or pulled from a **live search** backed by Arbeitnow
  (`lib/job-sources/arbeitnow.ts`), a free keyless job board API — no signup needed, works
  immediately. Either path scores the job the same way. Coverage is intentionally limited to
  what a keyless public API offers (mostly EU/remote tech roles) — LinkedIn and most major job
  boards require partner-level API access that isn't available to individual apps; a
  `JOB_BOARD_API_KEY`-gated second source (Adzuna/Jooble/etc.) can be added the same way once
  you have one. Saved searches double as job-alert configs (`notify_on_match`/`match_threshold`)
  once a source with match-worthy volume is wired up.
- **Career Command Center** (`/career`) — real KPIs (active applications, applications this
  week, interviews scheduled, high-match jobs, follow-ups due, offers), an Application Funnel
  (Saved → Applied → Assessment → Interview → Final → Offer, reusing the existing
  `application_status` enum — no schema change needed there) with stage conversion rates, and
  Today's Priorities computed from real `next_follow_up_at` / `interview_date` / high-match-job
  data — not a mock list.
- **Interviews** (`/career/interviews`) — built from existing `job_applications` rows in an
  interview stage, joined with `companies.notes`/`culture_notes`. Prep still routes to the
  existing Interview Prep / STAR Builder / Coding Practice tools rather than duplicating them.
- **Assessments** (`assessments`, `/career/assessments`) — a small tracker (type, platform,
  deadline, status, score) distinct from `job_applications.status = 'assessment'` because one
  application can carry several assessments. Setting a deadline auto-creates a linked `tasks`
  row, satisfying the spec's "assessments create tasks" integration requirement for real.
- **Career Analytics** (`/career/analytics`) — promotes the pre-existing (but previously
  unsurfaced) `getApplicationAnalytics` query to its own page, plus a new Source Analytics table
  (`getSourceAnalytics`) comparing response/interview/offer rates per application source.
- **Recruiters** — the existing Contacts feature relabeled; it already had
  `relationship`/`last_contacted_at`/`next_follow_up_at`, i.e. it already *was* a lightweight
  CRM. "Networking" from the spec is intentionally folded into this same page rather than built
  as a separate duplicate system.
- **LinkedIn sign-in** (`linkedin_connections`, Settings → Integrations) — Sign in with LinkedIn
  via Supabase's `linkedin_oidc` provider, mirroring the pre-existing GitHub identity link
  exactly (`supabase.auth.linkIdentity`, handled in `app/auth/callback/route.ts`). Requires
  enabling the provider in the Supabase dashboard (Authentication → Providers) with a LinkedIn
  Developer app's client ID/secret — not a Next.js env var, same as GitHub. **Scope limit is by
  LinkedIn's own design, not a gap in this build**: OIDC only ever returns name/email/photo.
  There is no LinkedIn API available to individual apps for job listings, connections, or
  messages outside their restricted partner program — that's why job data comes from a
  separate source (above), not from this connection.

- **Google OAuth foundation** (`google_connections`, `/settings/integrations`) — a *custom* OAuth
  flow (`app/auth/google/connect/route.ts` → Google's consent screen → `app/auth/google/callback/
  route.ts`), not Supabase's `linkIdentity` like GitHub/LinkedIn. It has to be custom because
  Career Inbox and interview scheduling need offline access (a refresh token) and specific
  Gmail/Calendar scopes — Supabase's generic Google sign-in only exposes provider tokens
  transiently on the client at sign-in and doesn't request extra scopes. The refresh token is
  encrypted at rest (AES-256-GCM, `lib/crypto/token-encryption.ts`, key from
  `TOKEN_ENCRYPTION_KEY`) and never sent to the client — `components/settings/google-connect.tsx`
  is typed to a summary shape that excludes the encrypted column entirely, not just hidden in the
  UI. `lib/google/token-manager.ts` exchanges it for a fresh access token on demand (nothing
  longer-lived than the refresh token is ever stored). **This is plumbing, not the feature**: it
  gets you to a connected state with Gmail/Calendar scopes granted, but nothing reads your inbox
  or touches your calendar yet — that's the Career Inbox / Scheduling Assistant UI, still to come.

## 9. Every table has an in-app editor

Four tables shipped with the schema in the original build but no UI ever read or wrote them —
closing that gap so every piece of user data is editable inside DevOS itself, never only via the
Supabase dashboard:

- **Course lessons** (`course_lessons`) — a per-course checklist (Learning → a course card's
  "Lessons" button). Checking lessons off recomputes the course's `progress`/`completed_lessons`
  automatically; the old manual +/-10% buttons still work for courses with no checklist.
- **Goal milestones** (`goal_milestones`) — identical pattern on Analytics → Goals.
- **Note folders** (`note_folders`) — a filter/organize row above the Notes grid: create, filter,
  delete (deleting a folder unfiles its notes rather than deleting them — `ON DELETE SET NULL`).
  The note-creation dialog picks a folder when any exist.
- **Daily Journal** (`daily_logs`, `/notes/journal`) — today's entry (what you worked on,
  learned, blockers, tomorrow's plan) plus a history list. Upserts on the table's existing
  `unique (user_id, log_date)` constraint, so revisiting today just updates the same row.

**Remaining work — architecture/UI scaffolded or foundation-only, marked Connection Required:**

| What | What it needs | Where |
| --- | --- | --- |
| Resume Studio tailoring, cover letters, answer library | `ANTHROPIC_API_KEY` (or another AI provider) | `/settings/ai` |
| Career Inbox UI (read/classify/draft) | Google connected (✅ above) + AI provider | `/career/inbox` |
| Scheduling Assistant UI (availability, event creation) | Google connected (✅ above) | `/career/interviews` |
| Job discovery beyond Arbeitnow, job alerts actually firing | An additional job board API (`JOB_BOARD_API_KEY`) | `/career/job-search`, `/settings/integrations` |
| Automation rules, audit log, full AI agent | AI provider + all of the above | — |

Required env vars for each are documented in `.env.local.example`. No token is ever exposed to
the client — every OAuth exchange and AI call runs server-side (Server Action or Route Handler).

## What's not built

Being direct about scope, since "production-ready" claims are only useful if they're accurate:

- **Remaining Career Agent phases** (AI resume tailoring/cover letters, Career Inbox + email
  drafting, interview scheduling, job alerts actually firing, automation rules) — see
  "8. Career Agent" above for exactly what's built (including LinkedIn sign-in and live job
  search) vs. Connection Required and why.
- **AI features (spec §24–27, Weekly Review §27)** — no AI Assistant, AI Project Planner,
  Learning Roadmap generator, Resume/Cover Letter writer, or Weekly Review page. These need an
  LLM API key this environment doesn't have; `/settings/ai` is an honest placeholder, not a
  working feature. The data model (projects, skills, notes) is already shaped to make these
  straightforward to add later — they'd be new Server Actions calling an LLM, not a schema change.
- **Dev Log (§29)** — `activity_log` is populated automatically but has no timeline UI yet.
  (Daily Journal, §28, is now built — see `/notes/journal`.)
- **Automatic notifications** — the `notifications` table and the bell-icon UI both exist and
  work, but nothing currently *writes* rows into it (e.g. a "task due tomorrow" reminder). It
  needs a scheduled job (Supabase cron / Edge Function) that doesn't exist in this codebase.
- **Real GitHub repo/commit sync** — Settings → Integrations links a GitHub *identity* via
  Supabase OAuth (functional once the provider is enabled in the Supabase dashboard) and stores
  it in `github_connections`. Pulling actual repos, stars, and commit activity from the GitHub
  API into `github_repos` and the Dashboard's "GitHub Commits" card is not implemented.
  connection is real; syncing is not.
- **Data import is best-effort, not a full relational restore** — `/settings/data` restores
  standalone rows (projects, tasks, notes, and similar) under new IDs but intentionally drops
  cross-references (a task's `project_id`, a job application's `company_id`) rather than risk
  silently wiring them to the wrong record. Documented in the UI itself, not just here.
