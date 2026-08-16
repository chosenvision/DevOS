import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required."),
  description: z.string().trim().optional(),
  status: z.enum(["idea", "planning", "in_progress", "testing", "completed", "on_hold", "archived"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.string().trim().optional(),
  isClientProject: z.boolean().default(false),
  clientName: z.string().trim().optional(),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  techStack: z.string().optional(),
  repoUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  liveUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectSchema>;
