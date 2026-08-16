import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getRoadmaps } from "@/services/queries/learning";
import { RoadmapPageClient } from "./roadmap-page-client";

export const metadata: Metadata = { title: "Roadmap — DevOS" };

export default async function RoadmapPage() {
  const { supabase, user } = await requireUser();
  const roadmaps = await getRoadmaps(supabase, user.id);

  return <RoadmapPageClient roadmaps={roadmaps} />;
}
