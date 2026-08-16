import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().optional(),
  status: z.enum(["backlog", "todo", "in_progress", "blocked", "review", "completed"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  category: z.string().trim().optional(),
  tags: z.string().optional(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  dueDate: z.string().optional(),
  estimatedMinutes: z.coerce.number().int().positive().optional().or(z.literal("")),
  recurrenceFrequency: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
});

export type TaskInput = z.infer<typeof taskSchema>;
