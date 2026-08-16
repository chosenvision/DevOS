"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { updateProfile, type ActionState } from "@/services/actions/profile";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import type { Profile } from "@/types/database";

const initialState: ActionState = {};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateProfile, initialState);

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="p-fullname">Full name</Label>
          <Input id="p-fullname" name="fullName" defaultValue={profile.full_name ?? ""} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-username">Username</Label>
          <Input id="p-username" name="username" defaultValue={profile.username ?? ""} placeholder="kristhian" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="p-role">Role</Label>
          <Input id="p-role" name="role" defaultValue={profile.role ?? ""} placeholder="Full-stack Developer" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-location">Location</Label>
          <Input id="p-location" name="location" defaultValue={profile.location ?? ""} placeholder="Manila, Philippines" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="p-bio">Bio</Label>
        <Textarea id="p-bio" name="bio" defaultValue={profile.bio ?? ""} rows={3} maxLength={280} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="p-github">GitHub URL</Label>
          <Input id="p-github" name="githubUrl" type="url" defaultValue={profile.github_url ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-linkedin">LinkedIn URL</Label>
          <Input id="p-linkedin" name="linkedinUrl" type="url" defaultValue={profile.linkedin_url ?? ""} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="p-portfolio">Portfolio URL</Label>
          <Input id="p-portfolio" name="portfolioUrl" type="url" defaultValue={profile.portfolio_url ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-website">Website URL</Label>
          <Input id="p-website" name="websiteUrl" type="url" defaultValue={profile.website_url ?? ""} />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}
