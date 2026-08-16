"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { codingProblemSchema } from "@/lib/validations/interview";

export type ActionState = { error?: string; success?: string };

function nextReviewDate(attempts: number): string {
  const days = [1, 3, 7, 14, 30][Math.min(attempts, 4)];
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function createCodingProblem(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = codingProblemSchema.safeParse({
    name: formData.get("name"),
    platform: formData.get("platform"),
    url: formData.get("url") || undefined,
    difficulty: formData.get("difficulty") || "medium",
    topic: formData.get("topic") || undefined,
    status: formData.get("status") || "todo",
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const topic = parsed.data.topic
    ? parsed.data.topic.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from("coding_problems").insert({
    user_id: user.id,
    name: parsed.data.name,
    platform: parsed.data.platform,
    url: parsed.data.url || null,
    difficulty: parsed.data.difficulty,
    topic,
    status: parsed.data.status,
  });

  if (error) return { error: error.message };

  revalidatePath("/career/coding-practice");
  return { success: "Problem added." };
}

export async function markProblemAttempted(problemId: string, solved: boolean, notes?: string) {
  const { supabase, user } = await requireUser();

  const { data: problem } = await supabase
    .from("coding_problems")
    .select("attempts")
    .eq("id", problemId)
    .single();

  const attempts = (problem?.attempts ?? 0) + 1;

  const { error } = await supabase
    .from("coding_problems")
    .update({
      attempts,
      status: solved ? "completed" : "in_progress",
      last_attempted_at: new Date().toISOString(),
      review_date: nextReviewDate(attempts),
      notes: notes || undefined,
    })
    .eq("id", problemId)
    .eq("user_id", user.id);

  revalidatePath("/career/coding-practice");
  return { error: error?.message };
}

export async function deleteCodingProblem(problemId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("coding_problems")
    .delete()
    .eq("id", problemId)
    .eq("user_id", user.id);

  revalidatePath("/career/coding-practice");
  return { error: error?.message };
}
