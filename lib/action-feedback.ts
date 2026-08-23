"use client";

import { toast } from "sonner";

/**
 * Wraps a fire-and-forget Server Action call (delete/toggle buttons that
 * don't otherwise manage their own pending/error state) so a failure
 * surfaces as a toast instead of the button silently doing nothing.
 */
export async function runAction<T extends { error?: string }>(
  fn: () => Promise<T>,
  successMessage?: string
): Promise<T> {
  const res = await fn();
  if (res.error) toast.error(res.error);
  else if (successMessage) toast.success(successMessage);
  return res;
}
