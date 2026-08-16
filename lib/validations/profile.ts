import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]{3,32}$/, "Username must be 3-32 characters: letters, numbers, - or _.")
    .optional()
    .or(z.literal("")),
  role: z.string().trim().optional(),
  location: z.string().trim().optional(),
  bio: z.string().trim().max(280, "Keep your bio under 280 characters.").optional(),
  githubUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  portfolioUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  websiteUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
});
