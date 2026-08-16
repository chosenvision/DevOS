import { z } from "zod";

export const habitSchema = z.object({
  name: z.string().trim().min(1, "Habit name is required."),
  category: z.string().trim().optional(),
  targetFrequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
  color: z.string().optional(),
});

export const goalSchema = z.object({
  title: z.string().trim().min(1, "Goal title is required."),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  period: z.enum(["weekly", "monthly", "quarterly", "yearly"]).default("monthly"),
  deadline: z.string().optional(),
});
