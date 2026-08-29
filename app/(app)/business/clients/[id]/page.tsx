import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requireActiveOrg } from "@/services/auth";
import { getCrmClientDetail } from "@/services/queries/crm";
import { ClientDetailClient } from "@/app/(app)/business/clients/[id]/client-detail-client";

export const metadata: Metadata = { title: "Client — DevOS" };

export default async function ClientDetailPage({ params }: PageProps<"/business/clients/[id]">) {
  const { id } = await params;
  const { supabase, organization } = await requireActiveOrg();
  const detail = await getCrmClientDetail(supabase, organization.id, id);

  if (!detail) notFound();

  return <ClientDetailClient organizationId={organization.id} detail={detail} />;
}
