"use client";

import { toast } from "sonner";
import { Link2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { disconnectLinkedin } from "@/services/actions/linkedin";
import type { LinkedinConnection } from "@/types/database";

export function LinkedinConnect({ connection }: { connection: LinkedinConnection | null }) {
  async function handleConnect() {
    const supabase = createClient();
    const origin = window.location.origin;

    const { error } = await supabase.auth.linkIdentity({
      provider: "linkedin_oidc",
      options: { redirectTo: `${origin}/auth/callback?next=/settings/integrations` },
    });

    if (error) {
      toast.error(
        error.message.includes("not enabled") || error.message.includes("provider")
          ? "LinkedIn sign-in isn't enabled on this Supabase project yet. Enable the linkedin_oidc provider under Authentication → Providers."
          : error.message
      );
    }
  }

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">LinkedIn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {connection ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={connection.avatar_url ?? undefined} />
                <AvatarFallback>
                  <Link2 className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{connection.linkedin_name}</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const res = await disconnectLinkedin();
                if (res.error) toast.error(res.error);
                else toast.success("Disconnected LinkedIn.");
              }}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Link your LinkedIn identity to show it on your profile.</p>
            <Button size="sm" onClick={handleConnect}>
              <Link2 className="size-3.5" /> Connect LinkedIn
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          LinkedIn only shares your name, email, and photo with third-party apps — not job listings,
          connections, or messages. Live job search below comes from a separate source.
        </p>
      </CardContent>
    </Card>
  );
}
