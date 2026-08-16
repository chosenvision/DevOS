import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { SecurityForm } from "@/components/settings/security-form";

export const metadata: Metadata = { title: "Security — DevOS" };

export default async function SecuritySettingsPage() {
  const { user } = await requireUser();

  return <SecurityForm email={user.email ?? ""} createdAt={user.created_at} />;
}
