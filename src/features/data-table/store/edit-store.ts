import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';

type EditStore<T extends { id: string }> = {
  editingRowId: string | null;
  draftValues: Partial<T>;
  undoSnapshots: Record<string, T>;
  startEditing: (id: string, item: T) => void;
  updateDraft: (field: keyof T, value: unknown) => void;
  saveRow: () => void;
  cancelEdit: () => void;
  undoRow: (id: string) => void;
  hasUndo: (id: string) => boolean;
};

export function createEditStore<T extends { id: string }>(
  useDataStore: UseBoundStore<
    StoreApi<{
      data: T[];
      updateItem: (id: string, partial: Partial<T>) => void;
    }>
  >,
) {
  return create<EditStore<T>>((set, get) => ({
    editingRowId: null,
    draftValues: {} as Partial<T>,
    undoSnapshots: {} as Record<string, T>,

    startEditing: (id, item) => {
      const state = get();
      if (state.editingRowId && state.editingRowId !== id) {
        const dataState = useDataStore.getState();
        const current = dataState.data.find((e) => e.id === state.editingRowId);
        if (current) {
          dataState.updateItem(state.editingRowId, state.draftValues);
          set({
            undoSnapshots: {
              ...state.undoSnapshots,
              [state.editingRowId]: { ...current },
            },
          });
        }
      }
      set({ editingRowId: id, draftValues: { ...item } as Partial<T> });
    },

    updateDraft: (field, value) =>
      set((state) => ({
        draftValues: { ...state.draftValues, [field]: value },
      })),

    saveRow: () => {
      const { editingRowId, draftValues } = get();
      if (!editingRowId) return;

      const dataState = useDataStore.getState();
      const current = dataState.data.find((e) => e.id === editingRowId);

      if (current) {
        set((state) => ({
          undoSnapshots: {
            ...state.undoSnapshots,
            [editingRowId]: { ...current },
          },
        }));
      }

      dataState.updateItem(editingRowId, draftValues);
      set({ editingRowId: null, draftValues: {} as Partial<T> });
    },

    cancelEdit: () =>
      set({ editingRowId: null, draftValues: {} as Partial<T> }),

    undoRow: (id) => {
      const state = get();
      const snapshot = state.undoSnapshots[id];
      if (!snapshot) return;

      useDataStore.getState().updateItem(id, snapshot);
      const snapshots = { ...state.undoSnapshots };
      delete snapshots[id];
      set({ undoSnapshots: snapshots });
    },

    hasUndo: (id) => id in get().undoSnapshots,
  }));
}
