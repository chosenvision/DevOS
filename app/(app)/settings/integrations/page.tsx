import type { Metadata } from "next";
import { Mail, CalendarDays } from "lucide-react";

import { requireUser } from "@/services/auth";
import { GithubConnect } from "@/components/settings/github-connect";
import { LinkedinConnect } from "@/components/settings/linkedin-connect";
import { IntegrationPlaceholderCard } from "@/components/settings/integration-placeholder-card";
import type { GithubConnection, LinkedinConnection } from "@/types/database";

export const metadata: Metadata = { title: "Integrations — DevOS" };

export default async function IntegrationsSettingsPage() {
  const { supabase, user } = await requireUser();
  const [{ data: githubConnection }, { data: linkedinConnection }] = await Promise.all([
    supabase.from("github_connections").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("linkedin_connections").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  return (
    <div className="space-y-4">
      <GithubConnect connection={githubConnection as GithubConnection | null} />
      <LinkedinConnect connection={linkedinConnection as LinkedinConnection | null} />

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
    </div>
  );
}
