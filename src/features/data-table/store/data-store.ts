import { create } from 'zustand';

import type { Employee } from '../types';

type DataStore = {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
};

export const useDataStore = create<DataStore>((set) => ({
  employees: [],
  setEmployees: (employees) => set({ employees }),
  updateEmployee: (id, data) =>
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp.id === id ? { ...emp, ...data } : emp,
      ),
    })),
}));
