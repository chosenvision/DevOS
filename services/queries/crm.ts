import type { SupabaseClient } from "@supabase/supabase-js";

import type { CrmActivity, CrmClient, CrmContact, CrmDeal, CrmDealStage } from "@/types/database";

export interface CrmClientWithCounts extends CrmClient {
  contact_count: number;
  open_deal_count: number;
}

export async function getCrmClients(supabase: SupabaseClient, organizationId: string): Promise<CrmClientWithCounts[]> {
  const { data: clients } = await supabase
    .from("crm_clients")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  const rows = (clients ?? []) as CrmClient[];
  if (rows.length === 0) return [];

  const clientIds = rows.map((c) => c.id);
  const [{ data: contacts }, { data: deals }] = await Promise.all([
    supabase.from("crm_contacts").select("client_id").in("client_id", clientIds),
    supabase.from("crm_deals").select("client_id, stage").in("client_id", clientIds),
  ]);

  const contactCounts = new Map<string, number>();
  for (const c of contacts ?? []) {
    contactCounts.set(c.client_id, (contactCounts.get(c.client_id) ?? 0) + 1);
  }
  const openDealCounts = new Map<string, number>();
  for (const d of deals ?? []) {
    if (d.stage === "won" || d.stage === "lost" || !d.client_id) continue;
    openDealCounts.set(d.client_id, (openDealCounts.get(d.client_id) ?? 0) + 1);
  }

  return rows.map((c) => ({
    ...c,
    contact_count: contactCounts.get(c.id) ?? 0,
    open_deal_count: openDealCounts.get(c.id) ?? 0,
  }));
}

export interface CrmClientDetail {
  client: CrmClient;
  contacts: CrmContact[];
  deals: CrmDeal[];
  activities: CrmActivity[];
}

export async function getCrmClientDetail(
  supabase: SupabaseClient,
  organizationId: string,
  clientId: string
): Promise<CrmClientDetail | null> {
  const { data: client } = await supabase
    .from("crm_clients")
    .select("*")
    .eq("id", clientId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!client) return null;

  const [{ data: contacts }, { data: deals }, { data: activities }] = await Promise.all([
    supabase.from("crm_contacts").select("*").eq("client_id", clientId).order("name"),
    supabase.from("crm_deals").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    supabase
      .from("crm_activities")
      .select("*")
      .eq("client_id", clientId)
      .order("occurred_at", { ascending: false })
      .limit(50),
  ]);

  return {
    client: client as CrmClient,
    contacts: (contacts ?? []) as CrmContact[],
    deals: (deals ?? []) as CrmDeal[],
    activities: (activities ?? []) as CrmActivity[],
  };
}

export interface CrmDealWithClient extends CrmDeal {
  client_name: string | null;
}

export async function getCrmDeals(supabase: SupabaseClient, organizationId: string): Promise<CrmDealWithClient[]> {
  const { data } = await supabase
    .from("crm_deals")
    .select("*, crm_clients(name)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as (CrmDeal & { crm_clients: { name: string } | null })[]).map((d) => {
    const { crm_clients, ...deal } = d;
    return { ...deal, client_name: crm_clients?.name ?? null };
  });
}

export async function getCrmContacts(supabase: SupabaseClient, organizationId: string): Promise<(CrmContact & { client_name: string | null })[]> {
  const { data } = await supabase
    .from("crm_contacts")
    .select("*, crm_clients(name)")
    .eq("organization_id", organizationId)
    .order("name");

  return ((data ?? []) as unknown as (CrmContact & { crm_clients: { name: string } | null })[]).map((c) => {
    const { crm_clients, ...contact } = c;
    return { ...contact, client_name: crm_clients?.name ?? null };
  });
}

export interface CrmOverview {
  openPipelineValue: number;
  dealsByStage: Record<CrmDealStage, number>;
  clientCount: number;
  recentActivities: (CrmActivity & { client_name: string | null })[];
}

export async function getCrmOverview(supabase: SupabaseClient, organizationId: string): Promise<CrmOverview> {
  const [{ data: deals }, { count: clientCount }, { data: activities }] = await Promise.all([
    supabase.from("crm_deals").select("value, stage").eq("organization_id", organizationId),
    supabase
      .from("crm_clients")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("crm_activities")
      .select("*, crm_clients(name)")
      .eq("organization_id", organizationId)
      .order("occurred_at", { ascending: false })
      .limit(8),
  ]);

  const dealsByStage: Record<CrmDealStage, number> = {
    lead: 0,
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };
  let openPipelineValue = 0;

  for (const d of deals ?? []) {
    dealsByStage[d.stage as CrmDealStage] += 1;
    if (d.stage !== "won" && d.stage !== "lost") {
      openPipelineValue += Number(d.value) || 0;
    }
  }

  const recentActivities = ((activities ?? []) as unknown as (CrmActivity & { crm_clients: { name: string } | null })[]).map(
    (a) => {
      const { crm_clients, ...activity } = a;
      return { ...activity, client_name: crm_clients?.name ?? null };
    }
  );

  return { openPipelineValue, dealsByStage, clientCount: clientCount ?? 0, recentActivities };
}
