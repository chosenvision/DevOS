import type { Metadata } from "next";
import { Inbox } from "lucide-react";

import { ConnectionRequired } from "@/components/shared/connection-required";

export const metadata: Metadata = { title: "Career Inbox — DevOS" };

export default function CareerInboxPage() {
  return (
    <ConnectionRequired
      icon={Inbox}
      title="Career Inbox needs a Gmail connection"
      description="Once connected, DevOS will classify recruiter emails, interview invites, assessments, and offers, link them to the right application, and help you draft natural-sounding replies — with your approval before anything sends."
      requirements={[
        "Google OAuth app (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)",
        "Gmail API scope: gmail.readonly + gmail.compose",
        "An AI provider key for classification and drafting (Settings → AI)",
      ]}
    />
  );
}
