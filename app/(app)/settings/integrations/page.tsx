import type { Metadata } from "next";
import { Mail, CalendarDays, Link2 } from "lucide-react";

import { requireUser } from "@/services/auth";
import { GithubConnect } from "@/components/settings/github-connect";
import { IntegrationPlaceholderCard } from "@/components/settings/integration-placeholder-card";
import type { GithubConnection } from "@/types/database";

export const metadata: Metadata = { title: "Integrations — DevOS" };

export default async function IntegrationsSettingsPage() {
  const { supabase, user } = await requireUser();
  const { data: connection } = await supabase
    .from("github_connections")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-4">
      <GithubConnect connection={connection as GithubConnection | null} />

      <IntegrationPlaceholderCard
        name="Gmail"
        icon={Mail}
        description="Powers the Career Inbox — classifying recruiter emails and drafting natural-sounding replies for your approval."
        requirements={["GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET", "Gmail API scope: gmail.readonly + gmail.compose"]}
      />
      <IntegrationPlaceholderCard
        name="Google Calendar"
        icon={CalendarDays}
        description="Lets DevOS check your availability and create interview events directly from a scheduling email."
        requirements={["GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET", "Calendar API scope: calendar.events"]}
      />
      <IntegrationPlaceholderCard
        name="LinkedIn"
        icon={Link2}
        description="Official LinkedIn OAuth/API access, where permitted, for profile data — never automated login or scraping."
        requirements={["LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET", "Access granted under LinkedIn's official API terms"]}
      />
    </div>
  );
}
