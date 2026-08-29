import { z } from "zod";

export const vendorSchema = z.object({
  name: z.string().trim().min(1, "Vendor name is required."),
  contactEmail: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type VendorInput = z.infer<typeof vendorSchema>;

const poLineItemSchema = z.object({
  itemId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().trim().min(1),
  quantity: z.coerce.number().positive().default(1),
  unitCost: z.coerce.number().nonnegative().default(0),
});

export const purchaseOrderSchema = z.object({
  vendorId: z.string().uuid().optional().or(z.literal("")),
  orderDate: z.string().min(1, "Order date is required."),
  expectedDate: z.string().optional(),
  notes: z.string().trim().optional(),
  lineItems: z.array(poLineItemSchema).min(1, "Add at least one line item."),
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;

export const payrollRecordSchema = z.object({
  memberId: z.string().uuid("Pick a team member."),
  payPeriodStart: z.string().min(1, "Start date is required."),
  payPeriodEnd: z.string().min(1, "End date is required."),
  grossAmount: z.coerce.number().nonnegative(),
  notes: z.string().trim().optional(),
});

export type PayrollRecordInput = z.infer<typeof payrollRecordSchema>;

export const timeOffRequestSchema = z.object({
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
  type: z.enum(["vacation", "sick", "unpaid"]).default("vacation"),
  notes: z.string().trim().optional(),
});

export type TimeOffRequestInput = z.infer<typeof timeOffRequestSchema>;
