import { create } from 'zustand';

import type { Employee } from '../types';

import { useDataStore } from './data-store';

type EditStore = {
  editingRowId: string | null;
  draftValues: Partial<Employee>;
  undoSnapshots: Record<string, Employee>;

  startEditing: (id: string, employee: Employee) => void;
  updateDraft: (field: keyof Employee, value: string | number) => void;
  saveRow: () => void;
  cancelEdit: () => void;
  undoRow: (id: string) => void;
  hasUndo: (id: string) => boolean;
};

export const useEditStore = create<EditStore>((set, get) => ({
  editingRowId: null,
  draftValues: {},
  undoSnapshots: {},

  startEditing: (id, employee) => {
    const state = get();
    if (state.editingRowId && state.editingRowId !== id) {
      const dataStore = useDataStore.getState();
      const current = dataStore.employees.find(
        (e) => e.id === state.editingRowId,
      );
      if (current) {
        dataStore.updateEmployee(state.editingRowId, state.draftValues);
        set({
          undoSnapshots: {
            ...state.undoSnapshots,
            [state.editingRowId]: { ...current },
          },
        });
      }
    }
    set({ editingRowId: id, draftValues: { ...employee } });
  },

  updateDraft: (field, value) =>
    set((state) => ({
      draftValues: { ...state.draftValues, [field]: value },
    })),

  saveRow: () => {
    const { editingRowId, draftValues } = get();
    if (!editingRowId) return;

    const dataStore = useDataStore.getState();
    const current = dataStore.employees.find((e) => e.id === editingRowId);

    if (current) {
      set((state) => ({
        undoSnapshots: {
          ...state.undoSnapshots,
          [editingRowId]: { ...current },
        },
      }));
    }

    dataStore.updateEmployee(editingRowId, draftValues);
    set({ editingRowId: null, draftValues: {} });
  },

  cancelEdit: () => set({ editingRowId: null, draftValues: {} }),

  undoRow: (id) => {
    const state = get();
    const snapshot = state.undoSnapshots[id];
    if (!snapshot) return;

    useDataStore.getState().updateEmployee(id, snapshot);
    const snapshots = { ...state.undoSnapshots };
    delete snapshots[id];
    set({ undoSnapshots: snapshots });
  },

  hasUndo: (id) => id in get().undoSnapshots,
}));
