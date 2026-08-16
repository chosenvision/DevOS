"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { interviewQuestionSchema, starResponseSchema } from "@/lib/validations/interview";

export type ActionState = { error?: string; success?: string };

export async function createInterviewQuestion(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = interviewQuestionSchema.safeParse({
    category: formData.get("category") || "behavioral",
    question: formData.get("question"),
    answer: formData.get("answer") || undefined,
    notes: formData.get("notes") || undefined,
    difficulty: formData.get("difficulty") || "medium",
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await supabase.from("interview_questions").insert({
    user_id: user.id,
    category: parsed.data.category,
    question: parsed.data.question,
    answer: parsed.data.answer || null,
    notes: parsed.data.notes || null,
    difficulty: parsed.data.difficulty,
  });

  if (error) return { error: error.message };

  revalidatePath("/career/interview-prep");
  return { success: "Question added." };
}

export async function updateQuestionConfidence(questionId: string, confidence: number) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("interview_questions")
    .update({ confidence_level: confidence, last_practiced_at: new Date().toISOString() })
    .eq("id", questionId)
    .eq("user_id", user.id);

  revalidatePath("/career/interview-prep");
  return { error: error?.message };
}

export async function deleteInterviewQuestion(questionId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("interview_questions")
    .delete()
    .eq("id", questionId)
    .eq("user_id", user.id);

  revalidatePath("/career/interview-prep");
  return { error: error?.message };
}

export async function createStarResponse(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = starResponseSchema.safeParse({
    title: formData.get("title"),
    situation: formData.get("situation") || undefined,
    task: formData.get("task") || undefined,
    action: formData.get("action") || undefined,
    result: formData.get("result") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await supabase.from("star_responses").insert({
    user_id: user.id,
    title: parsed.data.title,
    situation: parsed.data.situation || null,
    task: parsed.data.task || null,
    action: parsed.data.action || null,
    result: parsed.data.result || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/career/interview-prep");
  return { success: "STAR response saved." };
}

export async function deleteStarResponse(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("star_responses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/career/interview-prep");
  return { error: error?.message };
}
