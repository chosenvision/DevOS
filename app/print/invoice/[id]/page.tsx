import { notFound } from "next/navigation";

import { requireActiveOrg } from "@/services/auth";
import { getInvoiceDetail } from "@/services/queries/invoicing";
import { InvoicePrintView } from "@/components/business/invoice-print-view";

export default async function InvoicePrintPage({ params }: PageProps<"/print/invoice/[id]">) {
  const { id } = await params;
  const { supabase, organization } = await requireActiveOrg();
  const detail = await getInvoiceDetail(supabase, organization.id, id);

  if (!detail) notFound();

  return (
    <div className="min-h-svh bg-neutral-100 p-8 print:bg-white print:p-0">
      <InvoicePrintView detail={detail} orgName={organization.name} />
    </div>
  );
}
