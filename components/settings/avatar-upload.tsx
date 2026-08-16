"use client";

import * as React from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { updateAvatar } from "@/services/actions/profile";
import { initials } from "@/lib/utils";

export function AvatarUpload({ userId, name, avatarUrl }: { userId: string; name: string; avatarUrl: string | null }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState(avatarUrl);
  const [uploading, setUploading] = React.useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    const supabase = createClient();
    const path = `${userId}/avatar-${Date.now()}.${file.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await updateAvatar(data.publicUrl);
    setPreview(data.publicUrl);
    setUploading(false);
    toast.success("Avatar updated.");
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative"
        aria-label="Change avatar"
      >
        <Avatar className="size-16">
          <AvatarImage src={preview ?? undefined} alt={name} />
          <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="size-5 text-white" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="text-sm text-muted-foreground">
        {uploading ? "Uploading..." : "Click your avatar to change it."}
      </div>
    </div>
  );
}
