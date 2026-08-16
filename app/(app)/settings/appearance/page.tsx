import type { Metadata } from "next";

import { AppearanceForm } from "@/components/settings/appearance-form";

export const metadata: Metadata = { title: "Appearance — DevOS" };

export default function AppearanceSettingsPage() {
  return <AppearanceForm />;
}
