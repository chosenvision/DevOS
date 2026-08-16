import { z } from "zod";

export const snippetSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  language: z.string().trim().min(1, "Language is required."),
  description: z.string().trim().optional(),
  code: z.string().min(1, "Code is required."),
  tags: z.string().optional(),
  category: z.string().trim().optional(),
});

export const bookmarkSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  url: z.string().trim().url("Enter a valid URL."),
  category: z.string().trim().optional(),
  tags: z.string().optional(),
});
