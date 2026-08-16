import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { ProfileForm } from "@/components/settings/profile-form";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { GamificationCard } from "@/components/settings/gamification-card";
import type { Profile, Achievement } from "@/types/database";

export const metadata: Metadata = { title: "Profile — DevOS" };

export default async function ProfileSettingsPage() {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: achievements }, { data: userAchievements }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("achievements").select("*").order("sort_order"),
    supabase.from("user_achievements").select("achievement_key").eq("user_id", user.id),
  ]);

  const unlockedKeys = new Set((userAchievements ?? []).map((u) => u.achievement_key));

  return (
    <div className="space-y-6">
      <AvatarUpload userId={user.id} name={(profile as Profile).full_name ?? ""} avatarUrl={(profile as Profile).avatar_url} />
      <ProfileForm profile={profile as Profile} />
      <GamificationCard
        xp={(profile as Profile).xp}
        level={(profile as Profile).level}
        unlockedKeys={unlockedKeys}
        achievements={(achievements as Achievement[]) ?? []}
      />
    </div>
  );
}
