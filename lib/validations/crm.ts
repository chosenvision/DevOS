import { z } from "zod";

export const crmClientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required."),
  industry: z.string().trim().optional(),
  website: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  notes: z.string().trim().optional(),
});

export type CrmClientInput = z.infer<typeof crmClientSchema>;

export const crmContactSchema = z.object({
  clientId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Contact name is required."),
  email: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  role: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type CrmContactInput = z.infer<typeof crmContactSchema>;

export const crmDealSchema = z.object({
  clientId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(1, "Deal title is required."),
  value: z.coerce.number().nonnegative().default(0),
  currency: z.string().trim().default("USD"),
  stage: z.enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"]).default("lead"),
  ownerId: z.string().uuid().optional().or(z.literal("")),
  expectedCloseDate: z.string().optional(),
  notes: z.string().trim().optional(),
});

export type CrmDealInput = z.infer<typeof crmDealSchema>;

export const crmActivitySchema = z.object({
  clientId: z.string().uuid("Pick a client."),
  dealId: z.string().uuid().optional().or(z.literal("")),
  type: z.enum(["call", "email", "meeting", "note"]).default("note"),
  description: z.string().trim().min(1, "Description is required."),
  occurredAt: z.string().optional(),
});

export type CrmActivityInput = z.infer<typeof crmActivitySchema>;
