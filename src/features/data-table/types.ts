import type { ReactNode } from 'react';

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Legal',
  'Design',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: Department;
  salary: number;
  startDate: string;
}

export type ColumnConfig<T extends { id: string }> = {
  id: string;
  header: string;
  accessorKey: keyof T & string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  enableSorting?: boolean;
  enableFilter?: boolean;
  exportable?: boolean;
  filterFn?: (row: T, columnId: string, filterValue: unknown) => boolean;
  cell?: (value: unknown, row: T) => ReactNode;
  editCell?: (
    value: unknown,
    row: T,
    onChange: (val: unknown) => void,
  ) => ReactNode;
};
