"use client";

import { toast } from "sonner";
import { GitBranch } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { disconnectGithub } from "@/services/actions/github";
import type { GithubConnection } from "@/types/database";

export function GithubConnect({ connection }: { connection: GithubConnection | null }) {
  async function handleConnect() {
    const supabase = createClient();
    const origin = window.location.origin;

    const { error } = await supabase.auth.linkIdentity({
      provider: "github",
      options: { redirectTo: `${origin}/auth/callback?next=/settings/integrations` },
    });

    if (error) {
      toast.error(
        error.message.includes("not enabled") || error.message.includes("provider")
          ? "GitHub sign-in isn't enabled on this Supabase project yet. Enable it under Authentication → Providers."
          : error.message
      );
    }
  }

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">GitHub</CardTitle>
      </CardHeader>
      <CardContent>
        {connection ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={connection.avatar_url ?? undefined} />
                <AvatarFallback><GitBranch className="size-4" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">@{connection.github_username}</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const res = await disconnectGithub();
                if (res.error) toast.error(res.error);
                else toast.success("Disconnected GitHub.");
              }}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Link your GitHub identity to power repository and activity cards.
            </p>
            <Button size="sm" onClick={handleConnect}>
              <GitBranch className="size-3.5" /> Connect GitHub
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
