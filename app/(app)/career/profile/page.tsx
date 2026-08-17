import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getCareerProfile, getResumes } from "@/services/queries/career";
import { CareerProfileForm } from "@/components/career/career-profile-form";

export const metadata: Metadata = { title: "Career Profile — DevOS" };

export default async function CareerProfilePage() {
  const { supabase, user } = await requireUser();
  const [profile, resumes] = await Promise.all([
    getCareerProfile(supabase, user.id),
    getResumes(supabase, user.id),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Career Profile</h2>
        <p className="text-sm text-muted-foreground">
          This feeds the Job Match engine and, later, application prep and email drafting.
        </p>
      </div>
      <CareerProfileForm profile={profile} resumes={resumes} />
    </div>
  );
}
