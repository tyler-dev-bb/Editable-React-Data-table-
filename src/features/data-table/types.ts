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
