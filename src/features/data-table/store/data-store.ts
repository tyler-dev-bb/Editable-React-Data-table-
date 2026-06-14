import { create } from 'zustand';

type DataStore<T extends { id: string }> = {
  data: T[];
  setData: (data: T[]) => void;
  updateItem: (id: string, partial: Partial<T>) => void;
};

export function createDataStore<T extends { id: string }>() {
  return create<DataStore<T>>((set) => ({
    data: [],
    setData: (data) => set({ data }),
    updateItem: (id, partial) =>
      set((state) => ({
        data: state.data.map((d) => (d.id === id ? { ...d, ...partial } : d)),
      })),
  }));
}
