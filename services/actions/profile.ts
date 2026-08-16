"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/services/auth";
import { profileSchema } from "@/lib/validations/profile";

export type ActionState = { error?: string; success?: string };

export async function updateProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    username: formData.get("username") || undefined,
    role: formData.get("role") || undefined,
    location: formData.get("location") || undefined,
    bio: formData.get("bio") || undefined,
    githubUrl: formData.get("githubUrl") || undefined,
    linkedinUrl: formData.get("linkedinUrl") || undefined,
    portfolioUrl: formData.get("portfolioUrl") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      username: parsed.data.username || null,
      role: parsed.data.role || null,
      location: parsed.data.location || null,
      bio: parsed.data.bio || null,
      github_url: parsed.data.githubUrl || null,
      linkedin_url: parsed.data.linkedinUrl || null,
      portfolio_url: parsed.data.portfolioUrl || null,
      website_url: parsed.data.websiteUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return { error: "That username is already taken." };
    return { error: error.message };
  }

  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");
  return { success: "Profile updated." };
}

export async function updateAvatar(avatarUrl: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);

  revalidatePath("/settings/profile");
  return { error: error?.message };
}
