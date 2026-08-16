import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getGoals } from "@/services/queries/habits";
import { GoalsPageClient } from "./goals-page-client";

export const metadata: Metadata = { title: "Goals — DevOS" };

export default async function GoalsPage() {
  const { supabase, user } = await requireUser();
  const goals = await getGoals(supabase, user.id);

  return <GoalsPageClient goals={goals} />;
}
