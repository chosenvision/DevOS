import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getCertifications } from "@/services/queries/learning";
import { CertificationsPageClient } from "./certifications-page-client";

export const metadata: Metadata = { title: "Certifications — DevOS" };

export default async function CertificationsPage() {
  const { supabase, user } = await requireUser();
  const certifications = await getCertifications(supabase, user.id);

  return <CertificationsPageClient certifications={certifications} />;
}
