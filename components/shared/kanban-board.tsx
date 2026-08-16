"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { cn } from "@/lib/utils";

export interface KanbanColumn {
  id: string;
  label: string;
  accentClassName?: string;
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn[];
  items: T[];
  getId: (item: T) => string;
  getColumnId: (item: T) => string;
  renderCard: (item: T, dragging: boolean) => React.ReactNode;
  onMove: (itemId: string, columnId: string) => void;
}

function DraggableCard({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
          : undefined
      }
      className={cn("touch-none", isDragging && "opacity-40")}
    >
      {children}
    </div>
  );
}

function DroppableColumn({
  id,
  label,
  count,
  accentClassName,
  children,
}: {
  id: string;
  label: string;
  count: number;
  accentClassName?: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/30 transition-colors",
        isOver && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className={cn("size-1.5 rounded-full", accentClassName ?? "bg-muted-foreground")} />
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground">{count}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 pt-0">{children}</div>
    </div>
  );
}

export function KanbanBoard<T>({
  columns,
  items,
  getId,
  getColumnId,
  renderCard,
  onMove,
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const itemsByColumn = React.useMemo(() => {
    const map = new Map<string, T[]>();
    for (const col of columns) map.set(col.id, []);
    for (const item of items) {
      const colId = getColumnId(item);
      if (!map.has(colId)) map.set(colId, []);
      map.get(colId)!.push(item);
    }
    return map;
  }, [items, columns, getColumnId]);

  const activeItem = activeId ? items.find((i) => getId(i) === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const itemId = String(active.id);
    const columnId = String(over.id);
    const item = items.find((i) => getId(i) === itemId);
    if (item && getColumnId(item) !== columnId) {
      onMove(itemId, columnId);
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colItems = itemsByColumn.get(col.id) ?? [];
          return (
            <DroppableColumn key={col.id} id={col.id} label={col.label} count={colItems.length} accentClassName={col.accentClassName}>
              {colItems.map((item) => (
                <DraggableCard key={getId(item)} id={getId(item)}>
                  {renderCard(item, false)}
                </DraggableCard>
              ))}
            </DroppableColumn>
          );
        })}
      </div>
      <DragOverlay>{activeItem ? renderCard(activeItem, true) : null}</DragOverlay>
    </DndContext>
  );
}
