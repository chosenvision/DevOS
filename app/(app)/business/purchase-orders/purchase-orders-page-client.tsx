"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { VendorFormDialog } from "@/components/business/vendor-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { runAction } from "@/lib/action-feedback";
import { deletePurchaseOrder, updatePurchaseOrderStatus } from "@/services/actions/procurement";
import { PO_STATUS_BADGE, PO_STATUS_LABEL } from "@/lib/constants";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import type { PoStatus } from "@/types/database";
import type { PurchaseOrderWithVendor } from "@/services/queries/procurement";
import type { Vendor } from "@/types/database";

const STATUSES: PoStatus[] = ["draft", "sent", "received", "cancelled"];

export function PurchaseOrdersPageClient({
  organizationId,
  orders,
  vendors,
}: {
  organizationId: string;
  orders: PurchaseOrderWithVendor[];
  vendors: Vendor[];
}) {
  const router = useRouter();
  const [vendorDialogOpen, setVendorDialogOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{orders.length} purchase orders · {vendors.length} vendors</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setVendorDialogOpen(true)}>
            <Truck className="size-4" /> New vendor
          </Button>
          <Button onClick={() => router.push("/business/purchase-orders/new")}>
            <Plus className="size-4" /> New PO
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No purchase orders yet."
          description="Order stock from a vendor and receive it to update your item catalog automatically."
          actionLabel="Create purchase order"
          onAction={() => router.push("/business/purchase-orders/new")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Ordered</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-medium">{po.po_number}</TableCell>
                <TableCell className="text-muted-foreground">{po.vendor_name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{formatShortDate(po.order_date)}</TableCell>
                <TableCell>{formatCurrency(po.total)}</TableCell>
                <TableCell>
                  <Select value={po.status} onValueChange={(v) => runAction(() => updatePurchaseOrderStatus(organizationId, po.id, v))}>
                    <SelectTrigger className="h-8 w-28">
                      <Badge variant={PO_STATUS_BADGE[po.status]} className="pointer-events-none">
                        {PO_STATUS_LABEL[po.status]}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {PO_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {po.status === "draft" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-destructive"
                      aria-label={`Delete ${po.po_number}`}
                      onClick={() => runAction(() => deletePurchaseOrder(organizationId, po.id))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <VendorFormDialog organizationId={organizationId} open={vendorDialogOpen} onOpenChange={setVendorDialogOpen} />
    </div>
  );
}
