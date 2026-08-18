import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getOrCreateProfile } from "@/services/queries/profile";
import { ProfileForm } from "@/components/settings/profile-form";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { GamificationCard } from "@/components/settings/gamification-card";
import type { Achievement } from "@/types/database";

export const metadata: Metadata = { title: "Profile — DevOS" };

export default async function ProfileSettingsPage() {
  const { supabase, user } = await requireUser();

  const [profile, { data: achievements }, { data: userAchievements }] = await Promise.all([
    getOrCreateProfile(supabase, user.id, user.email),
    supabase.from("achievements").select("*").order("sort_order"),
    supabase.from("user_achievements").select("achievement_key").eq("user_id", user.id),
  ]);

  const unlockedKeys = new Set((userAchievements ?? []).map((u) => u.achievement_key));

  return (
    <div className="space-y-6">
      <AvatarUpload userId={user.id} name={profile.full_name ?? ""} avatarUrl={profile.avatar_url} />
      <ProfileForm profile={profile} />
      <GamificationCard
        xp={profile.xp}
        level={profile.level}
        unlockedKeys={unlockedKeys}
        achievements={(achievements as Achievement[]) ?? []}
      />
    </div>
  );
}
