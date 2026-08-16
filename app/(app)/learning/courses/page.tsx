import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getCourses } from "@/services/queries/learning";
import { CoursesPageClient } from "./courses-page-client";

export const metadata: Metadata = { title: "Courses — DevOS" };

export default async function CoursesPage() {
  const { supabase, user } = await requireUser();
  const courses = await getCourses(supabase, user.id);

  return <CoursesPageClient courses={courses} />;
}
