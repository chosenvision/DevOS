import { z } from "zod";

export const dailyLogSchema = z.object({
  logDate: z.string().min(1, "Date is required."),
  whatWorkedOn: z.string().trim().optional(),
  whatLearned: z.string().trim().optional(),
  blockers: z.string().trim().optional(),
  tomorrowPlan: z.string().trim().optional(),
});

export type DailyLogInput = z.infer<typeof dailyLogSchema>;
