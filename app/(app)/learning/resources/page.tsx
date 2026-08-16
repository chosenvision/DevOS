import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getResources } from "@/services/queries/learning";
import { ResourcesPageClient } from "./resources-page-client";

export const metadata: Metadata = { title: "Resources — DevOS" };

export default async function ResourcesPage() {
  const { supabase, user } = await requireUser();
  const resources = await getResources(supabase, user.id);

  return <ResourcesPageClient resources={resources} />;
}
