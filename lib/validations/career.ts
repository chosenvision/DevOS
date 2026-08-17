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

const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "internship"] as const;

export const careerProfileSchema = z.object({
  professionalSummary: z.string().trim().optional(),
  yearsExperience: z.coerce.number().nonnegative().optional().or(z.literal("")),
  skills: z.string().optional(),
  preferredRoles: z.string().optional(),
  preferredIndustries: z.string().optional(),
  preferredLocations: z.string().optional(),
  excludedCompanies: z.string().optional(),
  excludedKeywords: z.string().optional(),
  remoteOk: z.coerce.boolean().default(true),
  hybridOk: z.coerce.boolean().default(true),
  onsiteOk: z.coerce.boolean().default(true),
  employmentTypes: z.array(z.enum(EMPLOYMENT_TYPES)).default(["full_time"]),
  minSalary: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  targetSalary: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  noticePeriod: z.string().trim().optional(),
  workAuthorization: z.string().trim().optional(),
  primaryResumeId: z.string().uuid().optional().or(z.literal("")),
});

export type CareerProfileInput = z.infer<typeof careerProfileSchema>;

export const jobSearchSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  titles: z.string().optional(),
  keywords: z.string().optional(),
  locations: z.string().optional(),
  remoteOk: z.coerce.boolean().default(true),
  hybridOk: z.coerce.boolean().default(true),
  onsiteOk: z.coerce.boolean().default(true),
  employmentTypes: z.array(z.enum(EMPLOYMENT_TYPES)).default(["full_time"]),
  minSalary: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  notifyOnMatch: z.coerce.boolean().default(false),
  matchThreshold: z.coerce.number().int().min(0).max(100).default(80),
});

export type JobSearchInput = z.infer<typeof jobSearchSchema>;

export const jobListingSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  companyName: z.string().trim().min(1, "Company is required."),
  location: z.string().trim().optional(),
  workMode: z.enum(["remote", "hybrid", "onsite"]).optional().or(z.literal("")),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional().or(z.literal("")),
  salaryMin: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  salaryMax: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  description: z.string().trim().optional(),
  skills: z.string().optional(),
  url: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  source: z.string().trim().optional(),
  postedDate: z.string().optional(),
});

export type JobListingInput = z.infer<typeof jobListingSchema>;

export const assessmentSchema = z.object({
  companyName: z.string().trim().min(1, "Company is required."),
  role: z.string().trim().optional(),
  assessmentType: z
    .enum(["coding", "sql", "excel", "case_study", "personality", "video_interview", "take_home_project", "other"])
    .default("other"),
  platform: z.string().trim().optional(),
  url: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  deadline: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "submitted", "passed", "failed"]).default("not_started"),
  score: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  applicationId: z.string().uuid().optional().or(z.literal("")),
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;
