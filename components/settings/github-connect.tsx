"use client";

import * as React from "react";
import { toast } from "sonner";
import { GitBranch, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { disconnectGithub, syncGithubNow } from "@/services/actions/github";
import { formatRelativeTime } from "@/lib/utils";
import type { GithubConnection } from "@/types/database";

export function GithubConnect({ connection }: { connection: GithubConnection | null }) {
  const [syncing, setSyncing] = React.useState(false);

  async function handleConnect() {
    const supabase = createClient();
    const origin = window.location.origin;

    const { error } = await supabase.auth.linkIdentity({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback?next=/settings/integrations`,
        scopes: "read:user public_repo",
      },
    });

    if (error) {
      toast.error(
        error.message.includes("not enabled") || error.message.includes("provider")
          ? "GitHub sign-in isn't enabled on this Supabase project yet. Enable it under Authentication → Providers."
          : error.message
      );
    }
  }

  async function handleSync() {
    setSyncing(true);
    const res = await syncGithubNow();
    setSyncing(false);
    if (res.error) toast.error(res.error);
    else toast.success("GitHub data synced.");
  }

  const hasRepoAccess = !!connection?.access_token_encrypted;

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">GitHub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {connection ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={connection.avatar_url ?? undefined} />
                <AvatarFallback>
                  <GitBranch className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">@{connection.github_username}</p>
                <p className="text-xs text-muted-foreground">
                  {hasRepoAccess
                    ? connection.last_synced_at
                      ? `Synced ${formatRelativeTime(connection.last_synced_at)}`
                      : "Connected — not synced yet"
                    : "Connected (no repo access — reconnect to enable sync)"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {hasRepoAccess ? (
                <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                  <RefreshCw className={syncing ? "size-3.5 animate-spin" : "size-3.5"} />
                  {syncing ? "Syncing..." : "Sync now"}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleConnect}>
                  Reconnect
                </Button>
              )}
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
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Connect GitHub to power the Dashboard&apos;s commit activity card and your synced repo list.
            </p>
            <Button size="sm" onClick={handleConnect}>
              <GitBranch className="size-3.5" /> Connect GitHub
            </Button>
          </div>
        )}
        {connection && hasRepoAccess && connection.public_repos != null && (
          <p className="text-xs text-muted-foreground">
            {connection.public_repos} public repos · {connection.followers ?? 0} followers
          </p>
        )}
      </CardContent>
    </Card>
  );
}
