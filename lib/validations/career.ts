import { z } from "zod";

export const applicationSchema = z.object({
  companyName: z.string().trim().min(1, "Company is required."),
  position: z.string().trim().min(1, "Position is required."),
  location: z.string().trim().optional(),
  workMode: z.enum(["remote", "hybrid", "onsite"]).optional().or(z.literal("")),
  jobUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  salaryMin: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  salaryMax: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  status: z
    .enum([
      "saved",
      "preparing",
      "applied",
      "assessment",
      "interview",
      "final_interview",
      "offer",
      "rejected",
      "withdrawn",
    ])
    .default("saved"),
  dateApplied: z.string().optional(),
  source: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const ideaSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  potential: z.coerce.number().int().min(1).max(5).optional().or(z.literal("")),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().or(z.literal("")),
  techStack: z.string().optional(),
  status: z.enum(["inbox", "researching", "validated", "planned", "building", "archived"]).default("inbox"),
});

export type IdeaInput = z.infer<typeof ideaSchema>;

export const resourceSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  url: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  category: z.string().trim().optional(),
  tags: z.string().optional(),
  description: z.string().trim().optional(),
  status: z.enum(["unread", "reading", "completed", "saved_for_later"]).default("unread"),
});

export type ResourceInput = z.infer<typeof resourceSchema>;
