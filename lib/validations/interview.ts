import { z } from "zod";

export const interviewQuestionSchema = z.object({
  category: z.enum([
    "behavioral",
    "technical",
    "sql",
    "frontend",
    "backend",
    "system_design",
    "hr",
    "company_specific",
  ]),
  question: z.string().trim().min(1, "Question is required."),
  answer: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export const starResponseSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  situation: z.string().trim().optional(),
  task: z.string().trim().optional(),
  action: z.string().trim().optional(),
  result: z.string().trim().optional(),
});

export const codingProblemSchema = z.object({
  name: z.string().trim().min(1, "Problem name is required."),
  platform: z.string().trim().min(1, "Platform is required."),
  url: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  topic: z.string().optional(),
  status: z.enum(["backlog", "todo", "in_progress", "blocked", "review", "completed"]).default("todo"),
});
