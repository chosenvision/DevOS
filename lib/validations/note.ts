import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  content: z.string().optional().default(""),
  type: z.enum(["general", "project", "learning", "interview", "meeting", "code", "idea"]).default("general"),
  tags: z.string().optional(),
  projectId: z.string().uuid().optional().or(z.literal("")),
});

export type NoteInput = z.infer<typeof noteSchema>;
