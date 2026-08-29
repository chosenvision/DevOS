import { z } from "zod";

export const crmItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required."),
  description: z.string().trim().optional(),
  unitPrice: z.coerce.number().nonnegative().default(0),
  unit: z.enum(["hour", "fixed", "item"]).default("fixed"),
  sku: z.string().trim().optional(),
  stockQuantity: z.coerce.number().int().optional().or(z.literal("")),
});

export type CrmItemInput = z.infer<typeof crmItemSchema>;

const lineItemSchema = z.object({
  itemId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().trim().min(1),
  quantity: z.coerce.number().positive().default(1),
  unitPrice: z.coerce.number().nonnegative().default(0),
});

export const invoiceSchema = z.object({
  clientId: z.string().uuid().optional().or(z.literal("")),
  issueDate: z.string().min(1, "Issue date is required."),
  dueDate: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  currency: z.string().trim().default("USD"),
  notes: z.string().trim().optional(),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item."),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const expenseSchema = z.object({
  category: z.enum(["software", "hardware", "travel", "marketing", "contractor", "office", "other"]).default("other"),
  vendor: z.string().trim().optional(),
  amount: z.coerce.number().nonnegative(),
  expenseDate: z.string().min(1, "Date is required."),
  isBillable: z.boolean().default(false),
  clientId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().trim().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
