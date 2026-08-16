import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getHabits } from "@/services/queries/habits";
import { HabitsPageClient } from "./habits-page-client";

export const metadata: Metadata = { title: "Habits — DevOS" };

export default async function HabitsPage() {
  const { supabase, user } = await requireUser();
  const habits = await getHabits(supabase, user.id);

  return <HabitsPageClient habits={habits} />;
}
