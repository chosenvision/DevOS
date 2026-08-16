import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getCalendarItems } from "@/services/queries/calendar";
import { CalendarPageClient } from "./calendar-page-client";

export const metadata: Metadata = { title: "Calendar — DevOS" };

export default async function CalendarPage() {
  const { supabase, user } = await requireUser();
  const items = await getCalendarItems(supabase, user.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Tasks, deadlines, interviews, and study sessions in one view.
        </p>
      </div>
      <CalendarPageClient items={items} />
    </div>
  );
}
