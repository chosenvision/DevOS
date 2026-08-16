import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getCompanies } from "@/services/queries/career";
import { CompaniesPageClient } from "./companies-page-client";

export const metadata: Metadata = { title: "Companies — DevOS" };

export default async function CompaniesPage() {
  const { supabase, user } = await requireUser();
  const companies = await getCompanies(supabase, user.id);

  return <CompaniesPageClient companies={companies} />;
}
