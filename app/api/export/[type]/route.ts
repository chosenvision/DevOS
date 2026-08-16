import { NextResponse } from "next/server";

import { requireUser } from "@/services/auth";
import { toCsv } from "@/lib/csv";

const TABLE_BY_TYPE: Record<string, string> = {
  tasks: "tasks",
  projects: "projects",
  applications: "job_applications",
  learning: "courses",
  "time-tracking": "time_entries",
};

export async function GET(_request: Request, { params }: RouteContext<"/api/export/[type]">) {
  const { type } = await params;
  const table = TABLE_BY_TYPE[type];

  if (!table) {
    return NextResponse.json({ error: "Unknown export type." }, { status: 400 });
  }

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from(table).select("*").eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = toCsv(data ?? []);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="devos-${type}.csv"`,
    },
  });
}
