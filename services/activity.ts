import type { SupabaseClient } from "@supabase/supabase-js";

interface LogActivityParams {
  userId: string;
  entityType: string;
  entityId?: string;
  projectId?: string;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/** Server-only helper: records one row in activity_log. Never a Server Action itself. */
export async function logActivity(supabase: SupabaseClient, params: LogActivityParams) {
  await supabase.from("activity_log").insert({
    user_id: params.userId,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    project_id: params.projectId ?? null,
    action: params.action,
    message: params.message,
    metadata: params.metadata ?? {},
  });
}
