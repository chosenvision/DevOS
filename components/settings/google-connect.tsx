"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Mail, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { disconnectGoogle } from "@/services/actions/google";

/** Deliberately narrower than the google_connections row — encrypted_refresh_token never reaches the client, even as ciphertext. */
export interface GoogleConnectionSummary {
  google_email: string;
  google_name: string | null;
  avatar_url: string | null;
  gmail_connected: boolean;
  calendar_connected: boolean;
}

export function GoogleConnect({
  connection,
  configured,
}: {
  connection: GoogleConnectionSummary | null;
  configured: boolean;
}) {
  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm">Google (Gmail + Calendar)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connection ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={connection.avatar_url ?? undefined} />
                  <AvatarFallback>
                    <Mail className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{connection.google_name ?? connection.google_email}</p>
                  <p className="text-xs text-muted-foreground">{connection.google_email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const res = await disconnectGoogle();
                  if (res.error) toast.error(res.error);
                  else toast.success("Disconnected Google.");
                }}
              >
                Disconnect
              </Button>
            </div>
            <div className="flex gap-1.5">
              {connection.gmail_connected && (
                <Badge variant="success">
                  <Mail className="size-3" /> Gmail
                </Badge>
              )}
              {connection.calendar_connected && (
                <Badge variant="success">
                  <CalendarDays className="size-3" /> Calendar
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Career Inbox and interview scheduling aren&apos;t built yet — this connection is the foundation
              they&apos;ll use once they land.
            </p>
          </>
        ) : configured ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Powers the Career Inbox (email classification, draft replies) and interview scheduling, once those
              features are built. Connecting now gets the plumbing in place.
            </p>
            <Button size="sm" asChild>
              <Link href="/auth/google/connect">Connect Google</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Not configured on this deployment — add <code className="text-xs">GOOGLE_CLIENT_ID</code>,{" "}
              <code className="text-xs">GOOGLE_CLIENT_SECRET</code>, and{" "}
              <code className="text-xs">TOKEN_ENCRYPTION_KEY</code> to enable (see .env.local.example).
            </p>
            <Badge variant="muted" className="shrink-0">
              Not Connected
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
