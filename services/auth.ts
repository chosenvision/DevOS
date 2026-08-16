import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** Server-only helper for Server Components/Actions: returns the signed-in user or redirects to /login. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}
