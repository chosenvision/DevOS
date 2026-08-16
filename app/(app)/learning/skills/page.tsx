import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getSkills } from "@/services/queries/learning";
import { SkillsPageClient } from "./skills-page-client";

export const metadata: Metadata = { title: "Skills — DevOS" };

export default async function SkillsPage() {
  const { supabase, user } = await requireUser();
  const skills = await getSkills(supabase, user.id);

  return <SkillsPageClient skills={skills} />;
}
