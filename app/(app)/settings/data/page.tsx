import type { Metadata } from "next";

import { DataForm } from "@/components/settings/data-form";

export const metadata: Metadata = { title: "Data — DevOS" };

export default function DataSettingsPage() {
  return <DataForm />;
}
