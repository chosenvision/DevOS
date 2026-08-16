import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getContacts } from "@/services/queries/career";
import { ContactsPageClient } from "./contacts-page-client";

export const metadata: Metadata = { title: "Contacts — DevOS" };

export default async function ContactsPage() {
  const { supabase, user } = await requireUser();
  const contacts = await getContacts(supabase, user.id);

  return <ContactsPageClient contacts={contacts} />;
}
