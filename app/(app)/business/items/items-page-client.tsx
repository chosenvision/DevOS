"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ItemFormDialog } from "@/components/business/item-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { runAction } from "@/lib/action-feedback";
import { deleteCrmItem } from "@/services/actions/invoicing";
import { CRM_ITEM_UNIT_LABEL } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { CrmItem } from "@/types/database";

export function ItemsPageClient({ organizationId, items }: { organizationId: string; items: CrmItem[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} in your catalog
        </p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> New item
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No items yet."
          description="Add services or products so invoices can pull pricing automatically."
          actionLabel="Add item"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Billed</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-medium">{item.name}</p>
                  {item.sku && <p className="text-xs text-muted-foreground">{item.sku}</p>}
                </TableCell>
                <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                <TableCell className="text-muted-foreground">{CRM_ITEM_UNIT_LABEL[item.unit]}</TableCell>
                <TableCell>
                  {item.stock_quantity === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <Badge variant={item.stock_quantity <= 0 ? "destructive" : "outline"}>{item.stock_quantity}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive"
                    aria-label={`Delete ${item.name}`}
                    onClick={() => runAction(() => deleteCrmItem(organizationId, item.id))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ItemFormDialog organizationId={organizationId} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
