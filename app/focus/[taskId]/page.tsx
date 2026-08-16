import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getTaskWithSubtasks } from "@/services/queries/tasks";
import { FocusMode } from "@/components/tasks/focus-mode";

export const metadata: Metadata = { title: "Focus — DevOS" };

export default async function FocusPage({ params }: PageProps<"/focus/[taskId]">) {
  const { taskId } = await params;
  const { supabase, user } = await requireUser();
  const result = await getTaskWithSubtasks(supabase, user.id, taskId);

  if (!result) notFound();

  return <FocusMode task={result.task} subtasks={result.subtasks} />;
}
