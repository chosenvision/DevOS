import { z } from "zod";

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required."),
  website: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  industry: z.string().trim().optional(),
  size: z.string().trim().optional(),
  location: z.string().trim().optional(),
  careersUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  notes: z.string().trim().optional(),
  cultureNotes: z.string().trim().optional(),
  salaryNotes: z.string().trim().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  companyId: z.string().uuid().optional().or(z.literal("")),
  role: z.string().trim().optional(),
  linkedinUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  relationship: z.string().trim().optional(),
  nextFollowUpAt: z.string().optional(),
  notes: z.string().trim().optional(),
});
