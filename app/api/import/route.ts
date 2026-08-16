import { NextResponse } from "next/server";

import { requireUser } from "@/services/auth";

/**
 * Best-effort restore: re-inserts standalone rows from a DevOS JSON backup
 * under the current account. Cross-references between imported entities
 * (e.g. a task's project_id) are dropped rather than remapped, since the
 * original UUIDs won't match newly generated ones.
 */
const IMPORTABLE_TABLES: Record<string, string[]> = {
  projects: ["id", "user_id", "created_at", "updated_at"],
  tasks: ["id", "user_id", "project_id", "milestone_id", "recurrence_parent_id", "created_at", "updated_at"],
  notes: ["id", "user_id", "project_id", "folder_id", "created_at", "updated_at"],
  code_snippets: ["id", "user_id", "project_id", "created_at", "updated_at"],
  ideas: ["id", "user_id", "converted_project_id", "created_at", "updated_at"],
  bookmarks: ["id", "user_id"],
  resources: ["id", "user_id", "created_at", "updated_at"],
  certifications: ["id", "user_id", "created_at", "updated_at"],
  courses: ["id", "user_id", "created_at", "updated_at"],
  skills: ["id", "user_id", "created_at", "updated_at"],
  companies: ["id", "user_id", "created_at", "updated_at"],
  contacts: ["id", "user_id", "company_id", "created_at", "updated_at"],
  job_applications: ["id", "user_id", "company_id", "resume_id", "created_at", "updated_at"],
  interview_questions: ["id", "user_id", "company_id", "created_at", "updated_at"],
  star_responses: ["id", "user_id", "created_at", "updated_at"],
  coding_problems: ["id", "user_id", "created_at", "updated_at"],
  habits: ["id", "user_id", "created_at", "updated_at"],
  goals: ["id", "user_id", "related_project_id", "related_skill_id", "created_at", "updated_at"],
};

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();

  let body: { data?: Record<string, Record<string, unknown>[]> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid backup file." }, { status: 400 });
  }

  if (!body.data) {
    return NextResponse.json({ error: "This doesn't look like a DevOS backup file." }, { status: 400 });
  }

  const summary: Record<string, number> = {};

  for (const [table, stripFields] of Object.entries(IMPORTABLE_TABLES)) {
    const rows = body.data[table];
    if (!Array.isArray(rows) || rows.length === 0) continue;

    const cleaned = rows.map((row) => {
      const next: Record<string, unknown> = { ...row, user_id: user.id };
      for (const field of stripFields) {
        if (field !== "user_id") delete next[field];
      }
      return next;
    });

    const { error, count } = await supabase.from(table).insert(cleaned, { count: "exact" });
    if (!error) summary[table] = count ?? cleaned.length;
  }

  return NextResponse.json({ summary });
}
