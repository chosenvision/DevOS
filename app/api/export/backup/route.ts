import { NextResponse } from "next/server";

import { requireUser } from "@/services/auth";

const BACKUP_TABLES = [
  "profiles",
  "projects",
  "project_milestones",
  "bugs",
  "tasks",
  "task_subtasks",
  "time_entries",
  "courses",
  "skills",
  "roadmaps",
  "roadmap_steps",
  "resources",
  "certifications",
  "companies",
  "contacts",
  "job_applications",
  "resumes",
  "interview_questions",
  "star_responses",
  "coding_problems",
  "notes",
  "code_snippets",
  "ideas",
  "bookmarks",
  "portfolio_projects",
  "calendar_events",
  "habits",
  "habit_entries",
  "goals",
] as const;

export async function GET() {
  const { supabase, user } = await requireUser();

  const results = await Promise.all(
    BACKUP_TABLES.map(async (table) => {
      const filterColumn = table === "profiles" ? "id" : "user_id";
      const { data } = await supabase.from(table).select("*").eq(filterColumn, user.id);
      return [table, data ?? []] as const;
    })
  );

  const backup = {
    exported_at: new Date().toISOString(),
    version: 1,
    data: Object.fromEntries(results),
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="devos-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
