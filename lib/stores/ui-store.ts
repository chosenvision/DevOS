import { create } from "zustand";

export type QuickAddType =
  | "task"
  | "project"
  | "note"
  | "application"
  | "resource"
  | "coding_session"
  | "idea";

interface UIState {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  quickAddOpen: boolean;
  quickAddType: QuickAddType;
  openQuickAdd: (type?: QuickAddType) => void;
  closeQuickAdd: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  quickAddOpen: false,
  quickAddType: "task",
  openQuickAdd: (type = "task") => set({ quickAddOpen: true, quickAddType: type }),
  closeQuickAdd: () => set({ quickAddOpen: false }),
}));
