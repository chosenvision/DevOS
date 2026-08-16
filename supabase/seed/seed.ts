/**
 * Populates a DevOS account with realistic demo data.
 *
 * Usage:
 *   npm run seed -- --email you@example.com
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (Project Settings -> API).
 * The service role key bypasses RLS, which is required here since this runs
 * outside a logged-in browser session.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const emailArgIndex = process.argv.indexOf("--email");
const email = emailArgIndex !== -1 ? process.argv[emailArgIndex + 1] : undefined;

if (!email) {
  console.error("Usage: npm run seed -- --email you@example.com");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function iso(d: Date) {
  return d.toISOString();
}

function dateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log(`Looking up user ${email}...`);

  let userId: string | null = null;
  let page = 1;
  while (!userId) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email!.toLowerCase());
    if (match) userId = match.id;
    if (data.users.length < 200) break;
    page += 1;
  }

  if (!userId) {
    console.error(`No user found with email ${email}. Sign up in the app first.`);
    process.exit(1);
  }

  console.log(`Seeding data for user ${userId}...`);

  // ---------- Projects ----------
  const projectDefs = [
    {
      name: "AI Expense Tracker",
      slug: "ai-expense-tracker",
      description: "A personal finance app that categorizes spending automatically using an LLM and surfaces monthly trends.",
      status: "in_progress",
      priority: "high",
      category: "Web App",
      tech_stack: ["React", "Next.js", "Supabase", "TypeScript", "Tailwind CSS"],
      progress: 62,
      repo_url: "https://github.com/example/ai-expense-tracker",
      start_date: dateOnly(daysAgo(38)),
      deadline: dateOnly(daysFromNow(20)),
    },
    {
      name: "React Portfolio Website",
      slug: "react-portfolio-website",
      description: "Personal portfolio site built with React and Framer Motion, deployed on Vercel.",
      status: "completed",
      priority: "medium",
      category: "Website",
      tech_stack: ["React", "Vite", "Framer Motion", "Tailwind CSS"],
      progress: 100,
      repo_url: "https://github.com/example/portfolio",
      live_url: "https://example.dev",
      start_date: dateOnly(daysAgo(120)),
      deadline: dateOnly(daysAgo(95)),
    },
    {
      name: "Inventory Management System",
      slug: "inventory-management-system",
      description: "Internal tool for a small retail client to track stock levels, suppliers, and reorder points.",
      status: "in_progress",
      priority: "urgent",
      category: "Internal Tool",
      is_client_project: true,
      client_name: "Northgate Retail",
      tech_stack: ["Next.js", "PostgreSQL", "Prisma", "Node.js"],
      progress: 40,
      start_date: dateOnly(daysAgo(20)),
      deadline: dateOnly(daysFromNow(35)),
    },
    {
      name: "SQL Analytics Dashboard",
      slug: "sql-analytics-dashboard",
      description: "A dashboard for exploring sales data with saved SQL queries and chart building.",
      status: "planning",
      priority: "medium",
      category: "Data",
      tech_stack: ["Python", "SQL", "React", "Recharts"],
      progress: 10,
      start_date: dateOnly(daysAgo(4)),
    },
    {
      name: "E-Commerce API",
      slug: "e-commerce-api",
      description: "REST API for a headless e-commerce platform: catalog, cart, checkout, and webhooks.",
      status: "testing",
      priority: "high",
      category: "API",
      tech_stack: ["Node.js", "Express", "PostgreSQL", "Redis"],
      progress: 85,
      repo_url: "https://github.com/example/ecommerce-api",
      start_date: dateOnly(daysAgo(70)),
      deadline: dateOnly(daysFromNow(5)),
    },
  ];

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .insert(projectDefs.map((p) => ({ ...p, user_id: userId })))
    .select("id, slug, name");

  if (projectsError) throw projectsError;
  const projectBySlug = new Map(projects!.map((p) => [p.slug, p]));
  console.log(`Created ${projects!.length} projects.`);

  // ---------- Milestones ----------
  const expenseTracker = projectBySlug.get("ai-expense-tracker")!;
  await supabase.from("project_milestones").insert([
    { project_id: expenseTracker.id, user_id: userId, title: "Research & UI design", status: "completed", progress: 100, sort_order: 0, target_date: dateOnly(daysAgo(30)) },
    { project_id: expenseTracker.id, user_id: userId, title: "Frontend build", status: "completed", progress: 100, sort_order: 1, target_date: dateOnly(daysAgo(15)) },
    { project_id: expenseTracker.id, user_id: userId, title: "Backend & categorization engine", status: "in_progress", progress: 55, sort_order: 2, target_date: dateOnly(daysFromNow(7)) },
    { project_id: expenseTracker.id, user_id: userId, title: "Testing", status: "not_started", progress: 0, sort_order: 3, target_date: dateOnly(daysFromNow(15)) },
    { project_id: expenseTracker.id, user_id: userId, title: "Deployment", status: "not_started", progress: 0, sort_order: 4, target_date: dateOnly(daysFromNow(20)) },
  ]);

  // ---------- Tasks ----------
  const taskDefs = [
    { title: "Design the category confidence UI", project: "ai-expense-tracker", status: "in_progress", priority: "high", due_date: iso(daysFromNow(0)) },
    { title: "Wire up Supabase row-level security policies", project: "ai-expense-tracker", status: "todo", priority: "high", due_date: iso(daysFromNow(1)) },
    { title: "Write monthly trend aggregation query", project: "ai-expense-tracker", status: "todo", priority: "medium", due_date: iso(daysFromNow(3)) },
    { title: "Fix mobile nav overflow", project: "inventory-management-system", status: "todo", priority: "urgent", due_date: iso(daysFromNow(0)) },
    { title: "Add supplier reorder threshold field", project: "inventory-management-system", status: "backlog", priority: "medium", due_date: iso(daysFromNow(6)) },
    { title: "Load test checkout endpoint", project: "e-commerce-api", status: "in_progress", priority: "high", due_date: iso(daysFromNow(2)) },
    { title: "Write API documentation", project: "e-commerce-api", status: "todo", priority: "medium", due_date: iso(daysFromNow(4)) },
    { title: "Sketch dashboard wireframes", project: "sql-analytics-dashboard", status: "todo", priority: "low", due_date: iso(daysFromNow(8)) },
    { title: "Practice SQL joins", status: "todo", priority: "medium", due_date: iso(daysFromNow(0)), is_recurring: true, recurrence_frequency: "weekly", category: "Learning" },
    { title: "Solve a LeetCode problem", status: "todo", priority: "medium", due_date: iso(daysFromNow(0)), is_recurring: true, recurrence_frequency: "daily", category: "Interview prep" },
    { title: "Update resume with latest project", status: "completed", priority: "low", due_date: iso(daysAgo(3)), completed_at: iso(daysAgo(3)) },
    { title: "Follow up with Acme recruiter", status: "todo", priority: "high", due_date: iso(daysFromNow(1)), category: "Career" },
  ];

  await supabase.from("tasks").insert(
    taskDefs.map((t) => ({
      user_id: userId,
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date,
      completed_at: (t as { completed_at?: string }).completed_at ?? null,
      category: (t as { category?: string }).category ?? null,
      is_recurring: (t as { is_recurring?: boolean }).is_recurring ?? false,
      recurrence_frequency: (t as { recurrence_frequency?: string }).recurrence_frequency ?? null,
      project_id: t.project ? projectBySlug.get(t.project)?.id ?? null : null,
    }))
  );
  console.log(`Created ${taskDefs.length} tasks.`);

  // ---------- Time entries (coding hours over the last 3 weeks) ----------
  const timeEntries: Record<string, unknown>[] = [];
  const trackedProjects = [expenseTracker, projectBySlug.get("e-commerce-api")!, projectBySlug.get("inventory-management-system")!];
  for (let i = 0; i < 21; i++) {
    if (i % 7 === 0) continue; // skip one day a week
    const project = trackedProjects[i % trackedProjects.length];
    const minutes = 45 + ((i * 17) % 150);
    const start = daysAgo(i);
    start.setHours(9 + (i % 6), 0, 0, 0);
    timeEntries.push({
      user_id: userId,
      project_id: project.id,
      category: "project",
      started_at: iso(start),
      ended_at: iso(new Date(start.getTime() + minutes * 60000)),
      duration_minutes: minutes,
      is_running: false,
      source: "manual",
      description: "Feature work",
    });
  }
  for (let i = 0; i < 10; i++) {
    const start = daysAgo(i * 2);
    start.setHours(19, 0, 0, 0);
    const minutes = 30 + ((i * 11) % 60);
    timeEntries.push({
      user_id: userId,
      category: "learning",
      started_at: iso(start),
      ended_at: iso(new Date(start.getTime() + minutes * 60000)),
      duration_minutes: minutes,
      is_running: false,
      source: "manual",
      description: "Course study session",
    });
  }
  await supabase.from("time_entries").insert(timeEntries);
  console.log(`Created ${timeEntries.length} time entries.`);

  // ---------- Learning: courses & skills ----------
  await supabase.from("courses").insert([
    { user_id: userId, name: "Epic React", platform: "Udemy", instructor: "Kent C. Dodds", status: "in_progress", progress: 70, total_lessons: 120, completed_lessons: 84, start_date: dateOnly(daysAgo(45)), target_completion_date: dateOnly(daysFromNow(20)) },
    { user_id: userId, name: "Database Design & SQL", platform: "Coursera", status: "in_progress", progress: 45, total_lessons: 40, completed_lessons: 18, start_date: dateOnly(daysAgo(20)) },
    { user_id: userId, name: "The Complete Next.js Course", platform: "YouTube", status: "completed", progress: 100, completed_lessons: 60, total_lessons: 60, completed_at: iso(daysAgo(60)) },
    { user_id: userId, name: "System Design Interview Prep", platform: "Documentation", status: "not_started", progress: 0 },
  ]);

  await supabase.from("skills").insert([
    { user_id: userId, name: "React", category: "Frontend", level: "advanced", hours_practiced: 210 },
    { user_id: userId, name: "TypeScript", category: "Frontend", level: "advanced", hours_practiced: 160 },
    { user_id: userId, name: "Next.js", category: "Frontend", level: "confident", hours_practiced: 140 },
    { user_id: userId, name: "Node.js", category: "Backend", level: "intermediate", hours_practiced: 95 },
    { user_id: userId, name: "PostgreSQL", category: "Database", level: "intermediate", hours_practiced: 70 },
    { user_id: userId, name: "SQL", category: "Database", level: "intermediate", hours_practiced: 55 },
    { user_id: userId, name: "Python", category: "Backend", level: "beginner", hours_practiced: 20 },
    { user_id: userId, name: "Data Structures & Algorithms", category: "CS Fundamentals", level: "intermediate", hours_practiced: 80 },
    { user_id: userId, name: "Figma", category: "Design", level: "learning", hours_practiced: 8 },
  ]);

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .insert({ user_id: userId, title: "Frontend Developer Roadmap", description: "HTML through TypeScript, in order." })
    .select("id")
    .single();

  if (roadmap) {
    await supabase.from("roadmap_steps").insert([
      { roadmap_id: roadmap.id, user_id: userId, title: "HTML & CSS", status: "completed", sort_order: 0 },
      { roadmap_id: roadmap.id, user_id: userId, title: "JavaScript", status: "completed", sort_order: 1 },
      { roadmap_id: roadmap.id, user_id: userId, title: "React", status: "completed", sort_order: 2 },
      { roadmap_id: roadmap.id, user_id: userId, title: "Next.js", status: "current", sort_order: 3 },
      { roadmap_id: roadmap.id, user_id: userId, title: "TypeScript mastery", status: "upcoming", sort_order: 4 },
      { roadmap_id: roadmap.id, user_id: userId, title: "System design fundamentals", status: "upcoming", sort_order: 5 },
    ]);
  }

  await supabase.from("resources").insert([
    { user_id: userId, title: "A Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", category: "Article", status: "completed", rating: 5, tags: ["css", "reference"] },
    { user_id: userId, title: "Patterns.dev", url: "https://www.patterns.dev/", category: "Documentation", status: "reading", tags: ["react", "patterns"] },
    { user_id: userId, title: "Designing Data-Intensive Applications", category: "Book", status: "reading", tags: ["backend", "systems"] },
    { user_id: userId, title: "Supabase Docs — Row Level Security", url: "https://supabase.com/docs/guides/auth/row-level-security", category: "Documentation", status: "unread", tags: ["supabase", "security"] },
  ]);

  await supabase.from("certifications").insert([
    { user_id: userId, name: "Meta Front-End Developer", provider: "Coursera", date_earned: dateOnly(daysAgo(200)), credential_url: "https://coursera.org/verify/example", skills: ["React", "JavaScript", "HTML/CSS"] },
  ]);

  console.log("Seeded learning hub data.");

  // ---------- Career ----------
  const { data: companies } = await supabase
    .from("companies")
    .insert([
      { user_id: userId, name: "Acme Corp", industry: "SaaS", size: "200-500", location: "Remote", website: "https://acme.example.com" },
      { user_id: userId, name: "Northwind Labs", industry: "Fintech", size: "50-200", location: "New York, NY", website: "https://northwind.example.com" },
      { user_id: userId, name: "Bluepeak Software", industry: "Consulting", size: "10-50", location: "Remote", website: "https://bluepeak.example.com" },
    ])
    .select("id, name");

  const companyByName = new Map((companies ?? []).map((c) => [c.name, c]));

  await supabase.from("contacts").insert([
    { user_id: userId, company_id: companyByName.get("Acme Corp")?.id, name: "Jordan Lee", role: "Technical Recruiter", relationship: "Recruiter", last_contacted_at: dateOnly(daysAgo(5)), next_follow_up_at: dateOnly(daysFromNow(2)) },
    { user_id: userId, company_id: companyByName.get("Northwind Labs")?.id, name: "Priya Patel", role: "Engineering Manager", relationship: "Referral", last_contacted_at: dateOnly(daysAgo(14)), next_follow_up_at: dateOnly(daysFromNow(16)) },
  ]);

  await supabase.from("job_applications").insert([
    {
      user_id: userId,
      company_id: companyByName.get("Acme Corp")?.id,
      company_name: "Acme Corp",
      position: "Frontend Engineer",
      location: "Remote",
      work_mode: "remote",
      status: "interview",
      source: "LinkedIn",
      date_applied: dateOnly(daysAgo(12)),
      interview_date: iso(daysFromNow(3)),
      salary_min: 95000,
      salary_max: 120000,
    },
    {
      user_id: userId,
      company_id: companyByName.get("Northwind Labs")?.id,
      company_name: "Northwind Labs",
      position: "Full-Stack Developer",
      location: "New York, NY",
      work_mode: "hybrid",
      status: "assessment",
      source: "Referral",
      date_applied: dateOnly(daysAgo(6)),
      salary_min: 100000,
      salary_max: 130000,
    },
    {
      user_id: userId,
      company_id: companyByName.get("Bluepeak Software")?.id,
      company_name: "Bluepeak Software",
      position: "React Developer",
      location: "Remote",
      work_mode: "remote",
      status: "applied",
      source: "Company site",
      date_applied: dateOnly(daysAgo(3)),
    },
    {
      user_id: userId,
      company_name: "Vertex Systems",
      position: "Software Engineer",
      location: "Austin, TX",
      work_mode: "onsite",
      status: "rejected",
      source: "AngelList",
      date_applied: dateOnly(daysAgo(30)),
    },
  ]);

  await supabase.from("interview_questions").insert([
    { user_id: userId, category: "behavioral", question: "Tell me about a time you disagreed with a teammate.", answer: "During the expense tracker project, I disagreed with a teammate about state management...", difficulty: "medium", confidence_level: 4 },
    { user_id: userId, category: "technical", question: "Explain how React's reconciliation algorithm works.", difficulty: "hard", confidence_level: 3 },
    { user_id: userId, category: "sql", question: "Write a query to find the second highest salary per department.", difficulty: "medium", confidence_level: 3 },
    { user_id: userId, category: "system_design", question: "Design a URL shortener.", difficulty: "hard", confidence_level: 2 },
  ]);

  await supabase.from("star_responses").insert([
    {
      user_id: userId,
      title: "Handling a production outage",
      situation: "Our checkout API started returning 500s during a flash sale.",
      task: "I needed to diagnose and resolve the outage with minimal downtime.",
      action: "I traced it to a connection pool exhaustion issue, added a circuit breaker, and scaled the pool.",
      result: "Downtime was under 8 minutes and we shipped a permanent fix within a day.",
    },
  ]);

  await supabase.from("coding_problems").insert([
    { user_id: userId, name: "Two Sum", platform: "LeetCode", difficulty: "easy", status: "completed", attempts: 1, topic: ["Arrays", "Hash Maps"], last_attempted_at: iso(daysAgo(10)) },
    { user_id: userId, name: "Merge Intervals", platform: "LeetCode", difficulty: "medium", status: "completed", attempts: 2, topic: ["Arrays", "Sorting"], last_attempted_at: iso(daysAgo(5)), review_date: dateOnly(daysFromNow(2)) },
    { user_id: userId, name: "Longest Palindromic Substring", platform: "LeetCode", difficulty: "medium", status: "todo", attempts: 0, topic: ["Strings", "Dynamic Programming"] },
    { user_id: userId, name: "Course Schedule", platform: "LeetCode", difficulty: "medium", status: "in_progress", attempts: 1, topic: ["Graphs"], last_attempted_at: iso(daysAgo(1)), review_date: dateOnly(daysFromNow(1)) },
    { user_id: userId, name: "SQL: Rank Scores", platform: "HackerRank", difficulty: "hard", status: "completed", attempts: 1, topic: ["SQL"], last_attempted_at: iso(daysAgo(8)) },
  ]);

  console.log("Seeded career hub data.");

  // ---------- Notes, snippets, ideas, bookmarks ----------
  await supabase.from("notes").insert([
    {
      user_id: userId,
      title: "Expense Tracker — categorization approach",
      type: "project",
      project_id: expenseTracker.id,
      content: "## Approach\n\nUsing a small classification prompt per transaction, with a confidence threshold before asking the user to confirm.\n\n- [ ] Add manual override\n- [ ] Cache repeat merchants",
      tags: ["ai", "architecture"],
      is_pinned: true,
    },
    {
      user_id: userId,
      title: "1:1 notes with Priya",
      type: "meeting",
      content: "Discussed the team's stack (Next.js + Postgres). She mentioned a React opening on her team.",
      tags: ["networking"],
    },
    {
      user_id: userId,
      title: "SQL window functions cheat sheet",
      type: "learning",
      content: "`ROW_NUMBER()`, `RANK()`, `DENSE_RANK()` — partition with `OVER (PARTITION BY ... ORDER BY ...)`.",
      tags: ["sql"],
      is_favorite: true,
    },
  ]);

  await supabase.from("code_snippets").insert([
    {
      user_id: userId,
      title: "useDebounce hook",
      language: "TypeScript",
      description: "Debounce a fast-changing value.",
      code: "import { useEffect, useState } from \"react\";\n\nexport function useDebounce<T>(value: T, delay = 300): T {\n  const [debounced, setDebounced] = useState(value);\n\n  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(id);\n  }, [value, delay]);\n\n  return debounced;\n}",
      tags: ["react", "hooks"],
      category: "Hooks",
      is_favorite: true,
    },
    {
      user_id: userId,
      title: "Postgres upsert on conflict",
      language: "SQL",
      description: "Insert or update a row by unique key.",
      code: "insert into habit_entries (habit_id, user_id, entry_date, is_completed)\nvalues ($1, $2, $3, true)\non conflict (habit_id, entry_date)\ndo update set is_completed = true;",
      tags: ["postgres", "upsert"],
      category: "Database",
    },
  ]);

  await supabase.from("ideas").insert([
    { user_id: userId, title: "A habit tracker with a GitHub-style heatmap", category: "Project idea", potential: 4, difficulty: "medium", tech_stack: ["React", "Supabase"], status: "researching" },
    { user_id: userId, title: "Browser extension that saves code snippets from Stack Overflow", category: "Feature idea", potential: 3, difficulty: "easy", status: "inbox" },
    { user_id: userId, title: "Newsletter summarizing my weekly dev learnings", category: "Content idea", potential: 2, difficulty: "easy", status: "inbox" },
  ]);

  await supabase.from("bookmarks").insert([
    { user_id: userId, title: "Refactoring UI", url: "https://refactoringui.com/", website: "refactoringui.com", category: "Design" },
    { user_id: userId, title: "Josh Comeau — CSS Grid", url: "https://www.joshwcomeau.com/css/full-bleed/", website: "joshwcomeau.com", category: "Article" },
  ]);

  console.log("Seeded notes, snippets, ideas, and bookmarks.");

  // ---------- Habits & goals ----------
  const { data: habits } = await supabase
    .from("habits")
    .insert([
      { user_id: userId, name: "Code for at least 30 minutes", category: "Coding", target_frequency: "daily", color: "#6366f1" },
      { user_id: userId, name: "Solve a LeetCode problem", category: "Interview prep", target_frequency: "daily", color: "#22c55e" },
      { user_id: userId, name: "Read documentation", category: "Learning", target_frequency: "weekly", color: "#f59e0b" },
    ])
    .select("id");

  if (habits) {
    const entries: Record<string, unknown>[] = [];
    for (const habit of habits) {
      for (let i = 0; i < 45; i++) {
        if (Math.random() < 0.28) continue;
        entries.push({ habit_id: habit.id, user_id: userId, entry_date: dateOnly(daysAgo(i)), is_completed: true });
      }
    }
    await supabase.from("habit_entries").insert(entries);
  }

  await supabase.from("goals").insert([
    { user_id: userId, title: "Ship the AI Expense Tracker", category: "Project", period: "monthly", progress: 62, status: "in_progress", deadline: dateOnly(daysFromNow(20)) },
    { user_id: userId, title: "Land 3 first-round interviews", category: "Career", period: "monthly", progress: 33, status: "in_progress", deadline: dateOnly(daysFromNow(14)) },
    { user_id: userId, title: "Finish Epic React course", category: "Learning", period: "quarterly", progress: 70, status: "in_progress", deadline: dateOnly(daysFromNow(45)) },
  ]);

  console.log("Seeded habits and goals.");

  // ---------- Portfolio ----------
  await supabase.from("portfolio_projects").insert([
    {
      user_id: userId,
      project_id: projectBySlug.get("react-portfolio-website")!.id,
      title: "React Portfolio Website",
      description: "Personal portfolio site built with React and Framer Motion.",
      tech_stack: ["React", "Vite", "Framer Motion", "Tailwind CSS"],
      role: "Solo developer",
      problem: "Needed a fast, animated portfolio to showcase projects to recruiters.",
      solution: "Built a single-page app with scroll-triggered animations and a CMS-free content model.",
      outcome: "Used in every job application since launch; consistently gets recruiter compliments.",
      github_url: "https://github.com/example/portfolio",
      live_url: "https://example.dev",
      is_published: true,
      is_featured: true,
      sort_order: 0,
    },
    {
      user_id: userId,
      project_id: expenseTracker.id,
      title: "AI Expense Tracker",
      description: "A personal finance app that categorizes spending automatically.",
      tech_stack: ["React", "Next.js", "Supabase", "TypeScript"],
      role: "Solo developer",
      is_published: false,
      sort_order: 1,
    },
  ]);

  console.log("Seeded portfolio.");
  console.log("\nDone. Refresh the DevOS dashboard to see the seeded data.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
